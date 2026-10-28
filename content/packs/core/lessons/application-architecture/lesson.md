# Application Architecture: Web, Workers, and Services

A growing system does not become good by adding boxes. It becomes manageable by separating responsibilities that change at different speeds.

## The layers

Most web systems end up with four broad layers.

```text
client
  |
  v
[ edge ]          TLS, routing, static files, caching
  |
  v
[ application ]   auth, validation, business logic
  |        |
  |        +------> [ cache ]
  v
[ data ]          database, object store
  |
  v
[ workers ] <---- [ queue ] <---- application
```

- **Edge**: accepts public traffic and handles concerns common to every request.
- **Application**: runs the business rules and talks to storage.
- **Workers**: perform slow or bursty work outside the request path.
- **Data**: keeps the source of truth and the caches around it.

The separation is useful because each layer can scale, deploy, and fail on its own. It also creates network boundaries, which are new failure modes.

## Keep the application tier stateless

A stateless request handler keeps no user-specific state in memory between calls.

```text
stateful: session lives in this server's memory
          the next request may land elsewhere and lose it

stateless: session lives in a shared store or a signed token
           any server can serve the next request
```

Statelessness makes horizontal scaling, rolling deploys, and instance replacement simple. State still exists; it is concentrated in systems built to manage it, such as databases, caches, and queues.

Two related habits help:

- Make retried writes idempotent, because a load balancer may send a retry to a different instance.
- Store large objects outside the application process, such as in an object store.

## Monolith, modular monolith, microservices

A **monolith** is one deployable unit. It is not automatically bad. A single process is easier to run, debug, and transact across.

A **modular monolith** keeps one deployable unit but enforces clear internal boundaries: separate modules, explicit interfaces, and no reaching into another module's tables.

**Microservices** are independently deployable services, each owning a business capability and its data.

```text
modular monolith:
  [ app: users | orders | billing | search ]

microservices:
  [ users ] [ orders ] [ billing ] [ search ]
       \        |          |          /
              network
```

The trade is real:

| Choice           | Gains                                            | Costs                                                   |
| ---------------- | ------------------------------------------------ | ------------------------------------------------------- |
| Monolith         | Simple deploys, local calls, one transaction     | Coupled releases, one process to scale                  |
| Modular monolith | Clear boundaries without network calls           | Discipline must be enforced by the team                 |
| Microservices    | Independent deploys and scaling, clear ownership | Network failures, versioning, observability, operations |

Microservices are not a maturity badge. Use them when a concrete constraint demands independent scaling, independent release cadence, or separate team ownership. Otherwise a modular monolith is often the better default.

## Service discovery

When services call each other by name, something must translate the name into a healthy address.

```text
orders service asks: "where is inventory?"
registry answers:   "10.0.4.7:8080, healthy"
```

A registry stores service names, addresses, and health. Discovery can be:

- **Client-side**: the caller asks the registry and chooses an instance.
- **Server-side**: a proxy or load balancer chooses for the caller.
- **DNS-based**: names resolve to instances or a service proxy.

Health checks remove bad instances, but a shallow check can pass while the service is functionally broken. Choose the check deliberately and avoid making it so deep that a shared dependency removes every instance at once.

## The API gateway

An API gateway is a single entry point for clients.

It commonly handles:

- authentication and token validation;
- rate limiting and quotas;
- routing to the right service;
- request and response size limits;
- versioning and protocol translation;
- simple response aggregation.

It should not become the place where business logic lives. A gateway that knows how orders are priced is a distributed monolith with extra network hops.

## Synchronous and asynchronous calls

A synchronous call waits for an answer.

```text
client -> service A -> service B -> response
```

It is simple to reason about, but a slow or failed dependency becomes the caller's problem.

An asynchronous call hands work to a queue.

```text
client -> service A -> [ queue ] -> worker
                       response
```

It decouples availability and absorbs bursts, but the result is eventual and failures are harder to trace.

Use synchronous calls when the caller needs the result to continue. Use asynchronous work for notifications, exports, indexing, thumbnails, and other jobs the user does not need to wait for.

## Timeouts, retries, and circuit breakers

Every network call needs a deadline. Without one, a stuck dependency holds connections until the caller runs out of capacity.

Retries help with transient failures, but only when the operation is safe to repeat. Use:

- exponential backoff with jitter;
- a maximum attempt count;
- an idempotency key for writes;
- a circuit breaker that stops calling a failing dependency for a while;
- a fallback such as a cached value or a clear error.

A retry without a limit is a load amplifier.

## Deployment coupling

Two services that share a database are coupled even if they deploy separately. A schema change can break both at once.

Prefer:

- one owner per data set;
- versioned APIs with backward-compatible changes;
- expand-and-contract migrations: add the new field, dual-write or backfill, switch reads, then remove the old field;
- contract tests between services.

Deployment independence is only real when data and interfaces are independent too.

## What it costs

- More services mean more network calls, more failure modes, and more dashboards.
- A gateway or discovery layer is another critical dependency.
- Async work needs idempotency, retries, and a dead-letter path.
- Splitting a monolith can turn a local transaction into a distributed workflow.

## What to say in an interview

> "The edge terminates TLS and serves static assets. The stateless application tier owns validation and business logic. A worker tier consumes jobs for exports and notifications. Services register with discovery and expose health endpoints. The gateway handles authentication and rate limits, not business rules. Synchronous calls have deadlines and idempotent retries; async work goes through a queue with a dead-letter path."

That describes the boundaries, the scaling model, and the failure path without naming a product.
