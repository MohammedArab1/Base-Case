# Reference design: rate limiter

This is one reasonable answer. The important part is the reasoning about accuracy, latency, and failure behavior.

## Limit key and rules

A rule is a tuple:

```text
{ scope: "api_key" | "user" | "ip" | "endpoint", limit: 100, windowSeconds: 60, burst: 20 }
```

Rules are resolved from the most specific match to the most general:

1. Per-key override (temporary or support-issued).
2. Per-plan default.
3. Global default.

Allowlisted keys bypass enforcement but are still counted for observability.

## API contract

```text
HTTP/1.1 429 Too Many Requests
Retry-After: 12
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1735689600
```

Successful responses carry the same quota headers so clients can pace themselves. Clients should honor `Retry-After` and add jitter.

## Algorithm

Use a **token bucket** for burst-friendly limits, or a **sliding-window counter** when the contract is strictly "no more than N per window."

- Token bucket: capacity `burst`, refill rate `limit / window`. One counter and one timestamp per key. Allows short bursts and a smooth long-run rate.
- Sliding-window counter: combine the current fixed window with a weighted fraction of the previous window. Cheaper than a full log and avoids the worst boundary burst.
- Fixed window: simplest, but allows up to 2× the limit around a boundary.
- Sliding-window log: most accurate, but stores one timestamp per request and is expensive at scale.

For a multi-tenant API, token bucket is usually the best default. It maps cleanly to "requests per minute with a burst allowance."

## Atomicity and storage

Redis is a good fit:

```text
Key: rl:{scope}:{value}:{ruleId}
Hash: { tokens, lastRefillMs }
TTL: max(windowSeconds * 2, 60)
```

The check-and-decrement must be atomic. Use a Lua script or a Redis function so the read, refill, and write happen in one round trip:

```lua
-- Pseudocode
local tokens = tonumber(redis.call('HGET', key, 'tokens') or capacity)
local last = tonumber(redis.call('HGET', key, 'lastRefillMs') or now)
local refill = math.floor((now - last) * rate / 1000)
tokens = math.min(capacity, tokens + refill)
local allowed = tokens >= 1
if allowed then tokens = tokens - 1 end
redis.call('HSET', key, 'tokens', tokens, 'lastRefillMs', now)
redis.call('EXPIRE', key, ttl)
return { allowed and 1 or 0, tokens }
```

Use Redis Cluster with keys sharded by the limit key. Avoid a single global counter.

## Architecture

```text
Client -> API gateway (local token bucket) -> rate-limit check -> backend service
                    |                              |
                    +-> config cache               +-> Redis cluster
                                                       |
                                                       +-> metrics pipeline
```

- **Local tier:** each gateway keeps an in-memory token bucket per hot key and reconciles with Redis periodically. This absorbs the vast majority of checks without a network hop.
- **Shared tier:** Redis enforces the global budget when accuracy matters. A check only needs to hit Redis when the local bucket is exhausted or on a periodic sync.
- **Config service:** publishes rules with a version. Gateways keep the last known good version and refuse to apply a malformed rule set.
- **Metrics:** emit allow/deny counts, remaining quota, and Redis latency per rule.

## Scale

5 billion checks/day is about 58k QPS average, with peaks several times higher. A local-first design keeps most checks off Redis:

- 95%+ of checks are satisfied by the local bucket.
- Redis sees a small fraction of checks plus periodic syncs.
- Hot keys are replicated per gateway, so a single key never concentrates load on one Redis shard.
- Batch or pipeline syncs to reduce round trips.

At 200 million counter updates/day, Redis can comfortably handle the write rate when sharded.

## Trade-offs

- **Accuracy vs latency:** a purely local limiter is fast but lets each gateway admit its own share. A shared Redis check is more accurate but adds a network hop.
- **Token bucket vs sliding window:** token bucket is burst-friendly and cheap; sliding-window counters are stricter but need two windows of state.
- **Fail-open vs fail-closed:** failing open keeps the API available but allows abuse during a Redis outage. Failing closed protects the backend but turns a cache outage into an API outage. Choose per endpoint: fail-open for read APIs, fail-closed for expensive writes.
- **Centralized vs edge enforcement:** edge enforcement protects the backend earlier; service-level enforcement understands business limits. Use both for different scopes.
- **Exact vs approximate:** approximate counters are cheaper and adequate for abuse prevention; billing-grade quotas need stronger guarantees.

## Failure modes and monitoring

- **Redis outage:** fall back to local buckets with conservative limits, emit a degraded-mode metric, and page if the outage lasts.
- **Clock skew:** use Redis time or a monotonic clock for refill; never trust per-host wall clocks for shared budgets.
- **Hot key:** replicate the bucket locally, shard by key, or add a per-key admission queue.
- **Bad rule rollout:** version rules, validate before publishing, keep the last known good config, and support an instant global kill switch.
- **Counter loss:** accept a short over-admission window; rebuild from metrics if needed.
- **Metrics:** alert on deny-rate spikes, Redis p99, local/remote disagreement, config-version lag, and 429s caused by internal keys.

Monitor allow rate, deny rate, `Retry-After` distribution, Redis error rate, and the fraction of checks served locally. A sudden rise in local-only checks usually means Redis is unhealthy.
