# Caching and CDNs

A cache keeps a copy of data somewhere faster than the source. The trade is simple to state and hard to get right:

> Lower latency and less load, in exchange for memory and the risk of stale data.

## Cache-aside

The most common pattern:

```text
read:
  value = cache.get(key)
  if value exists:
      return value
  value = database.read(key)
  cache.set(key, value, ttl)
  return value

write:
  database.write(key, value)
  cache.delete(key)
```

The application owns the cache logic. A miss is visible as extra latency; a hit is fast.

## Other patterns

- **Read-through**: the cache itself loads from the database on a miss.
- **Write-through**: writes go through the cache and the database together.
- **Write-behind**: writes go to the cache first and are flushed later. Fast, but a crash can lose data.

Pick the pattern that matches the durability requirement. A cache is not a database unless you treat it like one.

## Eviction

A cache has a maximum size. When it is full, something must leave.

- **LRU (least recently used)**: evict the item touched longest ago. A hash map plus a doubly linked list gives `O(1)` updates.
- **LFU (least frequently used)**: evict the item with the fewest accesses.
- **FIFO**: evict the oldest inserted item. Simple, but ignores usage.

The eviction policy should match the access pattern. A feed cache with a few viral items may prefer LFU. A session cache with recency-heavy access may prefer LRU.

## Invalidation

There are only two hard problems in caching: naming things, and deciding when a copy is no longer true.

Common approaches:

- **TTL**: expire after a fixed time. Simple, bounded staleness.
- **Write invalidation**: delete or update the key after a write.
- **Versioned keys**: include a version in the key, so old entries become unreachable.
- **Event-driven invalidation**: publish a change event and let caches react.

Each has failure modes. A delete can fail after the database write. An event can arrive twice. A version bump can leave old keys until they expire. Say which one you chose and what stale window it allows.

## Cache stampede

A popular key expires, and thousands of requests miss at the same time.

```text
key "home-feed" expires
1000 requests -> 1000 database queries
```

Mitigations:

- **Request coalescing**: one request recomputes while the rest wait.
- **A short lock** around population.
- **Jittered TTLs** so keys do not expire together.
- **Serve stale while revalidating** when the product allows it.

## CDNs

A content delivery network is a cache at the edge of the network, close to users.

```text
user -> edge location -> origin
```

Static assets such as images, CSS, and videos are ideal. They change rarely and can be cached for a long time.

Cacheable API responses can also use a CDN if they are public and not user-specific. Private data needs `Cache-Control: private` or a per-user key. A shared edge cache that ignores authorization is a data leak, not an optimization.

## What to say in an interview

> "Reads go through a cache-aside layer with a five-minute TTL and LRU eviction. Writes invalidate the key. If the cache is cold, requests fall through to the database with a concurrency limit so a stampede cannot take it down. Static assets go to a CDN; personalized feeds do not."

That covers the strategy, the freshness bound, the failure mode, and the boundary.
