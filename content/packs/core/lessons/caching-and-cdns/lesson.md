# Caching and CDNs

A cache keeps a copy of data somewhere faster than the source. The trade is simple to state and hard to get right:

> Lower latency and less load, in exchange for memory and the risk of stale data.

## Where caches live

Caching is not one layer. The same idea appears at several points between the user and the source of truth.

```text
browser cache
  |
  v
CDN edge cache
  |
  v
reverse proxy / web server cache
  |
  v
application cache
  |
  v
database buffer cache
  |
  v
disk
```

- **Client cache**: the browser or operating system keeps a copy. Fast and free, but you do not control eviction.
- **CDN edge cache**: a shared cache close to users. Great for public, cacheable content.
- **Web server cache**: a reverse proxy serves stored responses without calling the application.
- **Application cache**: an in-memory store such as a key-value cache between the app and the database.
- **Database cache**: the database keeps hot pages in memory. It is usually automatic, but configuration and indexes affect hit rates.

Each layer needs an owner, a key, and an invalidation rule. More layers lower latency and add places where data can be stale.

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
- **Write-through**: writes go through the cache and the database together. The cache stays fresh, but every write pays both costs.
- **Write-behind**: writes go to the cache first and are flushed later. Fast, but a crash can lose data.
- **Refresh-ahead**: the cache refreshes a popular entry before it expires. Good when access is predictable; wasteful when it guesses wrong.

Pick the pattern that matches the durability requirement. A cache is not a database unless you treat it like one.

## Query-level versus object-level

A cache can store the result of a query or an assembled object.

```text
query-level:
  key = hash("SELECT ... WHERE user_id = 42")
  value = the result rows

object-level:
  key = "user:42"
  value = the full user object
```

Query-level caching is easy to add but hard to invalidate. If one cell changes, every cached query that included that cell may be wrong. Object-level caching gives you a clear boundary: when the object changes, remove that object.

Prefer object-level caching for data that changes in understandable units. Prefer query-level caching when the query is expensive, stable, and the invalidation surface is small. Avoid caching rendered HTML that mixes many objects unless you can invalidate the whole page.

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

There are two ways to fill the edge.

**Push CDN**: you upload content to the CDN when it changes.

```text
you -> upload -> CDN edge
```

You control when content is published and can set a long TTL. Storage costs more, and every change needs an upload step. Push works well for a small, stable set of large files.

**Pull CDN**: the edge fetches from your origin on the first request and caches the result.

```text
user -> edge (miss) -> origin
user <- edge (cached)
```

You keep the origin as the source of truth and rewrite URLs to the CDN. The first request is slower, and expired content may be fetched again even if it did not change. Pull works well for large, changing catalogs of content.

Cacheable API responses can also use a CDN if they are public and not user-specific. Private data needs `Cache-Control: private` or a per-user key. A shared edge cache that ignores authorization is a data leak, not an optimization.

## TTLs and jitter

A TTL bounds staleness, but a crowd of keys that expires at the same second can create a burst of misses. Add jitter to TTLs so expirations spread out.

```text
base TTL = 300 s
actual TTL = 300 s + random(0..60 s)
```

Jitter trades a little extra staleness for a smoother load curve. It is especially useful for feed pages, catalog listings, and other keys populated in batches.

## What to say in an interview

> "Reads go through an application cache-aside layer with a five-minute TTL and LRU eviction. Writes invalidate the object key. If the cache is cold, requests fall through to the database with a concurrency limit so a stampede cannot take it down. Static assets go to a pull CDN with a long TTL and versioned URLs; personalized feeds are not cached at the shared edge."

That covers the layer, the strategy, the freshness bound, the failure mode, and the boundary.
