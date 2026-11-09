# API Design

The API is the contract between your system and everyone who calls it. It defines the resources, inputs, outputs, errors, and rules for change. A clear contract makes the rest of the design easier to discuss.

## Start with the contract, not the diagram

Before choosing a database, write down what a client can do.

- Who calls the API: a browser, a mobile app, another service, or a partner?
- What are the four to six operations that matter?
- Which operations read and which write?
- What does the caller need on success, and what can fail?
- How will the API change without breaking existing clients?

The answers become the API sketch. The components exist to serve it.

## REST is the default

REST models the system as resources. Use plural nouns and let the HTTP method carry the action.

```text
GET    /links/{code}          read one link
POST   /links                 create a link
DELETE /links/{code}          delete a link
GET    /links?cursor=...      list links
```

Avoid paths such as `/getLink` or `/createLink`. The method already says what the operation is. Actions can still appear when the operation is not ordinary CRUD. For example, `POST /payments/{id}/capture` is clearer than pretending capture is a field update.

Keep nesting shallow. `/chats/{chatId}/messages` is easy to read. `/users/{userId}/chats/{chatId}/messages/{messageId}/reactions` is a routing puzzle. Use an opaque identifier when the parent is not needed.

Identifiers should be opaque strings, even if they contain a number today. Clients should not parse them or build them.

## Authentication comes from the token

The server derives the caller from a token or session. It must not trust a user ID in the body or query string.

```text
bad:
POST /messages
{ "senderId": "42", "chatId": "c-9", "text": "hello" }

good:
POST /messages
Authorization: Bearer <token>
{ "chatId": "c-9", "text": "hello" }
```

In the second version, the server reads the sender from the verified token. A client cannot post as another user by editing JSON.

Authentication answers "who are you?" Authorization answers "may you do this?" Return `401` when the token is missing or invalid. Return `403` when the caller is known but lacks permission. Check membership for the specific chat, file, or order, not only the general role.

## Status codes are part of the contract

Use the standard meanings.

```text
200  read or update succeeded
201  resource created; include a Location header
204  success with no response body
400  malformed request
401  missing or invalid credentials
403  authenticated but not allowed
404  resource not found
409  conflict with current state
422  request is well formed but violates a rule
429  rate limited; include Retry-After
5xx  server or dependency failed
```

A `200` response with `{"error": ...}` forces every client, cache, and dashboard to parse the body to learn that the call failed. Pick one error shape and keep it.

```json
{
  "error": {
    "code": "seat_taken",
    "message": "Seat 14C is no longer available"
  }
}
```

The code is stable for programs. The message is for humans and may change.

## Pagination: offset or cursor

Lists need a bound. Never return an unbounded collection.

**Offset pagination** uses `limit` and `offset`.

```text
GET /links?limit=20&offset=40
```

It is easy to build and lets a client jump to a page. It is unstable when rows are inserted or deleted: an item can appear twice or be skipped. Deep offsets also make the database walk many rows before returning data.

**Cursor pagination** uses an opaque marker that encodes the last item's sort position.

```text
GET /links?limit=20&cursor=eyJjcmVhdGVkQXQiOi...
```

```json
{
  "items": [],
  "nextCursor": "eyJjcmVhdGVkQXQiOi..."
}
```

A cursor is stable under inserts and lets the database continue from a known position. It does not support random page access. That is usually a fine trade for feeds, chat history, and audit lists.

Use a cursor when the list changes often or grows large. Use an offset when the data is small, stable, and the product needs page numbers.

## Idempotency keys protect writes

A client may retry after a timeout without knowing whether the first request succeeded. For a payment or reservation, a duplicate is expensive.

The client sends a unique key with the write.

```text
POST /payments
Idempotency-Key: 4f0c9a1e-...
{ "orderId": "o-123", "amountCents": 2500 }
```

The server stores the key and the result. A retry with the same key and the same request returns the original result instead of charging again. A retry with the same key and a different body is a conflict; return `409` or `422`.

Details that matter:

- Scope the key to the authenticated user or account.
- Give stored keys an expiry that is longer than the client's retry window.
- Use a unique constraint to handle two requests arriving at once.
- Store the response, not only a flag, so a retry can return the same status and body.

Idempotency is not the same as an idempotent method. `PUT` and `DELETE` are naturally repeatable. `POST` needs help.

## Versioning and evolution

Most changes should be additive. Adding an optional field or a new endpoint does not break old clients. Removing a field, changing a type, or changing the meaning of a value does.

Choose a versioning style and state it:

- **URL version**: `/v1/links`. Visible and easy to route.
- **Header version**: `Accept: application/vnd.example.v1+json`. Keeps URLs stable, but is harder to see in logs.

Run old and new versions side by side during a deprecation window. Measure who still calls the old one. Publish a removal date. Avoid creating a new version for every small change; each version is another contract to maintain.

## When GraphQL or gRPC is justified

REST is a good default for public resource-oriented APIs. Two alternatives are worth naming when their costs are justified.

**GraphQL** lets a client request a specific shape in one round trip. It fits when many client types need different slices of a large graph, and over-fetching is a measured problem. The costs are query complexity limits, harder HTTP caching, per-field authorization, and careful work to avoid N+1 reads.

**gRPC** fits internal service-to-service calls with a tight schema, code generation, deadlines, and streaming. It is a poor default for a public browser API or for clients that need to evolve independently.

The choice follows the consumer. A mobile app with changing screens may benefit from GraphQL. A payment service calling a ledger service may benefit from gRPC. A public link API probably does not need either.

## Public versus internal APIs

A public API needs documentation, stability, rate limits, abuse controls, a deprecation policy, and a versioned contract. An internal API can be less general, but it still needs deadlines, authentication, and a clear owner.

Internal does not mean informal. A service that returns a different shape on every deploy creates the same incidents as a broken public API, with fewer people watching.

## A worked example

For a seat reservation flow, six endpoints are enough for an interview.

```text
GET    /events/{eventId}/seats?cursor=...   list seats
POST   /reservations                        hold seats
GET    /reservations/{id}                   check a hold
DELETE /reservations/{id}                   release a hold
POST   /reservations/{id}/confirm           confirm after payment
GET    /events/{eventId}                    event details
```

`POST /reservations` requires an idempotency key. The body contains seat IDs, not a user ID; the user comes from the token. A hold returns `201` with an expiry time. A seat that is already held returns `409`. `DELETE` releases the hold and is safe to repeat. Confirmation checks that the hold belongs to the caller and has not expired.

Failure modes to state:

- Two users hold the same seat at once: a uniqueness constraint or transaction decides the winner.
- A client retries the hold: the idempotency key returns the first result.
- A hold expires during payment: confirmation fails with a clear conflict, and the client must choose another seat.
- A list changes while paging: a cursor prevents duplicates and gaps.

## What to say in an interview

> "I would expose REST resources under `/v1`: create and read links, delete a link, and list with cursor pagination. The user comes from the bearer token, never from the body. Creates accept an idempotency key, conflicts return `409`, and rate limits return `429` with `Retry-After`. If an internal service needs streaming, I would use gRPC behind the public API."

That covers the contract, the trust boundary, failure behavior, and when a different protocol is justified.
