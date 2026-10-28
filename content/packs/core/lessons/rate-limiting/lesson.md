# Rate Limiting

A rate limiter answers one question:

> "Should this request be allowed right now, given how much this caller has already used?"

It protects shared capacity, keeps one tenant from starving others, limits abuse, and controls cost.

## Token bucket

Imagine a bucket that holds tokens.

- The bucket holds at most `B` tokens.
- Tokens refill at `R` per second.
- Each request spends one token.
- If the bucket is empty, the request is rejected or delayed.

```text
B = 10, R = 2/s

idle for 5 seconds -> bucket has 10 (capped)
10 quick requests  -> allowed
11th request       -> rejected until a token refills
```

The bucket size is the **burst allowance**. The refill rate is the **long-term average**. This is the most common production algorithm because it matches how clients actually behave.

You do not need a timer per bucket. Store the token count and the last refill time, then compute the refill lazily when a request arrives.

```text
elapsed = now - last_refill
tokens = min(B, tokens + elapsed * R)
last_refill = now

if tokens >= 1:
    tokens -= 1
    allow
else:
    reject
```

## Fixed window

Count requests in a one-minute window. Reset the count at the boundary.

```text
00:00 - 01:00: 100 requests allowed
01:00 - 02:00: 100 requests allowed
```

It is cheap and easy. The problem is the boundary: a client can send 100 requests at 00:59 and 100 at 01:00, producing 200 in two seconds.

## Sliding window

A sliding window avoids the boundary spike.

- **Log**: keep timestamps of recent requests and count those inside the last window. Precise but memory-heavy.
- **Counter**: keep the current and previous window counts and interpolate. A good compromise.

## Leaky bucket

A leaky bucket processes requests at a fixed rate and queues the rest. It smooths traffic rather than allowing bursts. Use it when downstream systems need a steady rate, not when clients need burst tolerance.

## Distributed rate limiting

If each node keeps its own counter, the effective limit is multiplied by the node count. Use a shared store with an atomic increment, or accept a small over-admission.

```text
key = "user:42:minute:2026-10-27T12:31"
INCR key
if result == 1: EXPIRE key 60
if result > limit: reject
```

The increment and expiry are two operations. A crash between them can leave a key without a TTL. Use a Lua script or a store operation that makes the check atomic.

Fail-open versus fail-closed is a product decision:

- **Fail open**: if the limiter store is down, allow traffic. Protects availability, risks overload.
- **Fail closed**: reject when unsure. Protects capacity, risks an outage for legitimate users.

State which one you chose and why.

## What to limit

- per user or account;
- per IP, with care for NAT and shared proxies;
- per API key or tenant;
- per endpoint, because a cheap read and an expensive export are not equal;
- per resource, such as one chat room or one document.

A single global limit is rarely enough. Layer limits: a broad per-user limit plus a stricter limit on expensive endpoints.

## Client behavior

Return:

```text
HTTP/1.1 429 Too Many Requests
Retry-After: 12
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 12
```

A clear response lets a well-behaved client back off. A silent rejection or a generic 500 makes the client retry immediately and makes the problem worse.

## The design sentence

> "Each user has a token bucket of 100 requests with a refill of 10 per second, stored in Redis and updated atomically. Expensive export endpoints have a second, smaller bucket. We return 429 with Retry-After, and the limiter fails open for reads but closed for writes."

That names the identity, the algorithm, the storage, the error contract, and the failure choice.
