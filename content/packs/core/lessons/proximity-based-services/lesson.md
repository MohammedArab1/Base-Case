# Proximity-Based Services

A nearby search asks a different question from a global search. Global search ranks documents by a query. Nearby search filters by distance first, then ranks a small candidate set.

Examples: drivers near a rider, restaurants within two kilometers, stores that deliver to an address.

## Nearby search versus global search

A global index is built for text relevance over a large corpus. A proximity index is built to prune space. Most entities are far away and should not be examined.

Pin down:

- radius and result limit;
- latency;
- location freshness;
- exact distance versus approximation;
- privacy rules.

A restaurant search can tolerate a location that is a few minutes old. Driver dispatch cannot.

## Latitude and longitude

A location is a latitude and a longitude. Latitude runs from -90 to 90; longitude runs from -180 to 180. One degree of latitude is about 111 km everywhere. One degree of longitude is about 111 km at the equator and shrinks by `cos(latitude)` toward the poles.

```text
a = sin^2(dlat/2) + cos(lat1) * cos(lat2) * sin^2(dlon/2)
d = 2 * R * asin(sqrt(a))
R = 6371 km
```

Haversine is accurate enough for product search. For short distances, a flat approximation with a corrected longitude scale is faster. Do not treat degree differences as kilometers.

## Bounding box first

Start with a box that contains the circle.

```text
lat_min = lat - r / 111
lat_max = lat + r / 111
lon_min = lon - r / (111 * cos(lat))
lon_max = lon + r / (111 * cos(lat))
```

Fetch the box with a normal index, then compute exact distance and drop candidates outside the circle. Near the poles the longitude span needs care. A box that crosses the antimeridian must be split.

This two-step query is often enough at moderate scale.

## Geohash

A geohash encodes a point as a short string. Each character adds precision, and a shared prefix means the same cell.

```text
"9q8yy"  San Francisco area
"9q8yyk" smaller cell inside it
```

```text
5 chars  ~4.9 km x 4.9 km
6 chars  ~1.2 km x 0.6 km
7 chars  ~150 m x 150 m
```

Query the prefix for the radius plus the eight surrounding cells. A point near a cell edge can be close to a point in the next cell. Forgetting neighbors is a classic bug.

The grid is fixed, so dense cities and empty oceans use the same cell size. A large cell can hold many entities. Choose precision from the radius and expected density.

## Grids and quadtrees

A grid assigns each entity to a fixed cell, such as a 500 m square. A query checks the cell and its neighbors. This is easy to update when entities move often.

A quadtree splits a region into four children when it holds too many points. Dense areas get smaller cells and empty areas stay coarse.

```text
+---------+---------+
|         |   +--+  |
|         |   |  |  |
|         |   +--+  |
+---------+---------+
|         |         |
|         |         |
+---------+---------+
```

The adaptive split handles skewed density, but the tree needs rebalancing as points move. Spatial databases use R-trees or similar structures for points and shapes.

## Tools and trade-offs

**PostGIS** stores `GEOGRAPHY` or `GEOMETRY` and uses a GiST index. It supports exact distance, radius search, polygons, and joins. It is transactional and durable. Every location update is a database write.

```text
CREATE INDEX places_geo ON places USING GIST (location);

SELECT id, name
FROM places
WHERE ST_DWithin(location, ST_MakePoint(:lon, :lat)::geography, 2000)
ORDER BY location <-> ST_MakePoint(:lon, :lat)::geography
LIMIT 20;
```

**Redis geospatial** keeps a sorted set scored by geohash. `GEOADD` writes a position and `GEOSEARCH` finds members in a radius or box. It is fast for live, changing positions. Memory is the limit, and durability depends on configuration.

**Elasticsearch** has a `geo_point` type plus `geo_distance` and `geo_bounding_box` queries. It fits proximity combined with text filters, ratings, and aggregations. Its index is usually eventually consistent, so it is a poor source of truth for dispatch.

Choose by update rate, query shape, durability, and the tools the team already runs. Live positions in a cache plus history in a durable store is a common split.

## Regional sharding

Shard by region, city, or geohash prefix.

```text
shard "9q8" -> San Francisco
shard "dr5" -> New York
```

A query goes to one shard plus neighbors when the radius crosses a boundary. Busy cities scale independently. The costs are boundary queries, uneven shards, and entities that move between regions. A traveler's position must be written to the new shard and removed from the old one.

## Moving entities and location updates

A driver sends a position every few seconds. The current position is hot and short-lived. History is append-only and less urgent.

```text
driver app -> location service -> validate
                              -> update live index
                              -> append history asynchronously
```

Throttle updates and store `last_seen`. Expire entries that stop updating, and never dispatch to a driver outside the freshness window. A cell update should remove the old entry and add the new one, or use a version so a late write cannot replace a newer position.

## Radius queries and ranking

```text
1. encode the user's point
2. fetch candidate cells that cover the radius
3. compute exact distance
4. filter by availability, hours, price, and permissions
5. rank and return the top N
```

Distance is a filter and a ranking input. A blended score might add rating, wait time, and paid placement. Compute distance first so the candidate set stays small.

Map pagination needs a cursor with distance and a stable ID. Page numbers can repeat or skip results as entities move.

## Privacy and precision

Exact location is sensitive. Collect only what the feature needs.

- Store a coarse cell when a neighborhood is enough.
- Add noise or snap to a grid before showing a location to others.
- Limit access to high-precision queries.
- Keep history for a short, stated period.
- Support deletion and respect data residency.

A delivery app needs an exact address. A dating app needs an approximate distance. An analytics job may need only a postal code.

## When a linear scan is fine

A linear scan is reasonable for a small data set, a low query rate, or an offline job.

```text
10,000 restaurants, 20 queries per second
compute distance to every row -> still fast
```

Even a few hundred thousand rows can work with a bounding-box index and a distance filter. Measure before adding a second index and a synchronization pipeline.

## Failure modes

- A query misses a neighboring cell. Check the cells around every edge.
- A location is stale. Use a TTL and a `last_seen` window.
- A hot city cell overloads one shard. Split the cell or add a local cache.
- Two dispatchers claim one driver. Use a conditional write or a lease.
- The live index is lost. Rebuild it from durable history and accept a short delay.

## Worked example: find nearby drivers

Requirements: find drivers within 5 km; return the 10 nearest available; update positions every 3 seconds; never offer one driver to two riders.

```text
driver -> location service -> live geo index
rider  -> dispatch service -> query nearby -> rank -> reserve -> offer
```

1. A driver sends latitude, longitude, and status. The service validates it, writes to Redis with a TTL, and appends a history event.
2. A rider sends a pickup point. The dispatcher computes geohash prefixes covering 5 km plus neighbors.
3. It fetches candidates, computes exact distance, filters to available drivers, and sorts by distance and wait time.
4. It reserves the top driver with a conditional write. If that fails, it tries the next candidate.
5. The offer times out. If the driver declines, the reservation is released and the next driver is offered.

If Redis is unavailable, fall back to a PostGIS read replica. If a driver's update is stale, the TTL removes them. If two requests race, the conditional reservation picks one winner.

## What to say in an interview

> "We keep live driver positions in Redis with a geospatial index and a short TTL, and persist history asynchronously. A rider query covers the geohash cells for a 5 km radius plus neighbors, computes exact distance, filters to available drivers, and ranks by distance and wait time. A conditional reservation prevents double offers. PostGIS is the durable fallback. We shard by metro area and keep precise locations out of public responses."

That names the index, update path, consistency mechanism, and privacy boundary.
