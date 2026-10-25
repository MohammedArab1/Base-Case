# Reference design: URL shortener

This is one reasonable answer, not the only one. Compare the choices and the reasoning, not the exact diagram.

## API

```text
POST /v1/links
  { "url": "https://example.com/very/long", "alias": "launch", "expiresAt": "2027-01-01T00:00:00Z" }
  -> 201 { "code": "launch", "shortUrl": "https://sho.rt/launch" }
  -> 409 if the alias is taken
  -> 400 for an invalid URL or expiry

GET /:code
  -> 302 Location: <original URL>
  -> 404 if unknown or expired
  -> 410 if the link was deleted

DELETE /v1/links/:code
  -> 204

GET /v1/links/:code/stats?from=...&to=...
  -> 200 { "clicks": 1234, "countries": {...}, "referrers": {...} }
```

Creation is idempotent when the client supplies an `Idempotency-Key`. Redirects are anonymous and heavily cached.

## Data model

**Links** (key-value or partitioned relational table):

| Field        | Notes                                                       |
| ------------ | ----------------------------------------------------------- |
| `code`       | Primary key. Random base62, 7 characters.                   |
| `url`        | Original URL, validated and normalized.                     |
| `owner_id`   | Nullable for anonymous links.                               |
| `created_at` | Creation timestamp.                                         |
| `expires_at` | Nullable. Checked on read and by a reaper.                  |
| `deleted_at` | Soft delete so caches can be invalidated deterministically. |

**Clicks** (append-only analytics store, e.g. Kafka → columnar warehouse):

| Field                               | Notes                   |
| ----------------------------------- | ----------------------- |
| `code`                              | Partition key.          |
| `clicked_at`                        | Event time.             |
| `country`, `referrer`, `user_agent` | Coarse dimensions only. |

The redirect path is a single key lookup by `code`. Analytics never blocks a redirect.

## Key generation

- Generate 7 random base62 characters (62^7 ≈ 3.5 trillion combinations).
- Insert with a conditional write; on collision, retry with a new code.
- Custom aliases are checked for availability and reserved words.
- Do not use sequential ids: they leak volume and are trivial to enumerate.

## High-level architecture

```text
Client -> CDN/edge cache -> Redirect service -> Link cache (Redis) -> Links store
                                   |
                                   +-> Click events -> Kafka -> analytics warehouse

Owner -> API service -> Links store
                     +-> cache invalidation on create/delete/expire
```

- **Redirect service** is stateless, read-only, and deployed close to users.
- **Link cache** holds the hot working set. A miss falls back to the links store and populates the cache.
- **API service** handles creation and deletion, then invalidates the cache entry.
- **Analytics pipeline** is asynchronous; a lost click is acceptable, a failed redirect is not.

## Read path at scale

1. CDN serves the redirect for the hottest links with a short TTL.
2. On a cache miss, the redirect service reads Redis.
3. On a Redis miss, it reads the links store and writes back with a TTL.
4. Expired or deleted links are treated as misses and return 404/410.

At 1 billion redirects per day (about 12k QPS average, with peaks several times higher), a small number of cache nodes can absorb most reads. The links store only sees cache misses.

## Write path at scale

- 10 million writes per day is about 116 writes per second average.
- Writes go through the API service to a partitioned store keyed by `code`.
- Cache invalidation is best effort; a short TTL bounds staleness.
- Custom aliases use the same uniqueness constraint as generated codes.

## Trade-offs

- **Random codes vs sequential ids:** random codes cost a collision check but avoid enumeration and volume leakage.
- **SQL vs key-value store:** a relational store is simpler for ownership and analytics joins; a key-value store scales the redirect path more cheaply. Start relational and move the hot mapping to a key-value store if needed.
- **Cache-aside vs write-through:** cache-aside keeps writes simple and tolerates cache outages; write-through reduces first-read latency but couples writes to the cache.
- **Strong vs eventual analytics:** analytics can lag. Redirects must not wait for a click to be counted.
- **Soft delete vs hard delete:** soft delete makes cache invalidation and audit easier, at the cost of retention and cleanup work.

## Failure modes and monitoring

- **Cache outage:** redirects fall back to the store; latency rises and the store must be protected with rate limits and load shedding.
- **Store outage:** serve stale cache entries if the TTL allows; otherwise return 503 rather than a wrong redirect.
- **Hot key:** replicate or shard the hot code, or let the CDN absorb it.
- **Abuse and phishing:** scan destinations, rate-limit creation, allow takedowns, and keep an audit trail.
- **Analytics backlog:** scale consumers; clicks can be delayed but not dropped silently.
- **Expiry reaper:** run it idempotently and alert on backlog growth.

Monitor redirect p99 latency, cache hit rate, store error rate, creation error rate, Kafka consumer lag, and 404/410 rates. Alert on a sudden drop in redirect throughput, which often means a bad deploy or an upstream outage.

## Checklist

- [ ] Create, redirect, delete, and analytics APIs with error cases.
- [ ] Key generation and collision handling.
- [ ] Mapping and analytics schemas with keys and indexes.
- [ ] Cache strategy and invalidation.
- [ ] Read and write paths sized against the stated traffic.
- [ ] Availability, replication, and degraded modes.
- [ ] Trade-offs with at least one alternative each.
- [ ] Monitoring, abuse handling, and recovery.
