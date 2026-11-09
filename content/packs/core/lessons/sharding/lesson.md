# Sharding

A single database can hold a lot of data. Sharding is what you do when it cannot hold or write any more. The decision is less about size and more about whether one primary can serve the write path.

## When one primary is not enough

Four pressures drive the decision.

- **Storage**: data plus indexes no longer fit on one primary's disks.
- **Write throughput**: every write goes through one primary, and replicas do not help writes.
- **Read throughput after replicas**: read replicas saturate or fall too far behind.
- **Memory**: the working set no longer fits in RAM, so reads hit disk.

Try the cheaper moves first: query and index tuning, caching, read replicas, a larger primary, and archiving cold data. Sharding is close to last because it raises operational cost permanently.

```text
one primary -> read replicas -> cache -> bigger primary -> archive -> shard
```

## Choose a shard key

The shard key decides which shard owns a row. Good keys have four properties:

- **High cardinality**: many distinct values.
- **Even access and storage**: no single value dominates.
- **Stable**: the value does not change often.
- **Aligned with common queries**: a request touches one shard.

Bad keys include country (few values and heavy skew), status, a timestamp alone (new rows hit one shard), a celebrity user id (hot shard), and a monotonically increasing id under range sharding (the newest shard takes all writes).

A composite key can help. Range sharding by `(tenant_id, user_id)` keeps a tenant's data in one range while giving the directory a finer key to move. For posts, shard by `user_id` and keep `created_at` as the sort key within the shard rather than putting it in the shard key.

## Routing schemes

**Hash sharding** computes `shard = hash(key) % N`.

```text
key "user:42" -> hash -> 8134 -> 8134 % 4 = 2 -> shard 2
```

Hash sharding tends to distribute data evenly, but range queries fan out. Adding shards remaps many keys unless you use consistent hashing.

**Range sharding** assigns key ranges to shards.

```text
shard 0: user_id 1..10M
shard 1: user_id 10M..20M
shard 2: user_id 20M..30M
```

Range scans within a shard are cheap. Hotspots appear when writes cluster at one end of the ranges. Range sharding fits time-series with retention, but monotonic ids need a plan to spread writes.

**Directory sharding** uses a lookup service that maps each key to a shard.

```text
app -> directory -> shard 7
```

Placement is flexible and migration is explicit. The directory is another hop and another system to keep available. Cache the mapping and version it.

## Keep related data together

The best shard key makes the most common query single-shard.

- User-centric product: shard by `user_id`. A user's posts, settings, and messages live together.
- Multi-tenant product: shard by `tenant_id`, with a sub-key when one tenant is large.
- URL shortener: shard by short code, because a redirect looks up one code.
- Payment ledger: shard by account, but a transfer touches two accounts. That is a cross-shard transaction unless both accounts share a shard or a saga handles it.

When a second access path is common, you have options: duplicate the data into a second sharded view, maintain a global secondary index, or fan out. Name the cost of the option you choose.

## Hotspots and celebrity keys

Hashing spreads keys, not requests. A single celebrity account or trending post can overload one shard.

```text
99% of shards idle
one shard at 100% CPU because one key is viral
```

Mitigations:

- cache the hot value close to readers;
- split the hot key into a fixed number of sub-keys and merge results;
- give the hot object its own shard or dedicated cache;
- coalesce identical requests.

For writes, a counter on a hot row is a serialization point. Split the counter into buckets and sum them, or batch increments.

## Cross-shard queries and transactions

A query without the shard key must go to every shard.

```text
app -> shard 0
    -> shard 1
    -> shard 2
    -> shard 3
merge results, then handle a slow or failed shard
```

Costs: latency is the slowest shard, results need merging and pagination, and one failed shard makes the answer partial. Keep such queries off the request path when you can.

Cross-shard transactions are harder. Two-phase commit coordinates participants but adds latency and locking. Sagas break the work into steps with compensating actions. The outbox pattern makes event publication reliable. Prefer a shard key that keeps the invariant on one shard. When that is impossible, say which consistency model you accept.

Unique ids also need a plan: UUIDs, a central range allocator, or per-shard sequences with a shard prefix.

## Resharding and operations

Shard count is not permanent. Data grows, tenants grow, and hardware changes.

- **Logical shards**: create many logical partitions and map them to fewer physical nodes. Moving a logical shard is a metadata change plus a copy.
- **Consistent hashing**: add nodes with limited key movement, at the cost of more routing complexity.
- **Directory**: move a key range and update the map.

An online move usually needs dual writes, a backfill, verification, and a cutover. Throttle the copy so production traffic keeps its latency budget. Plan backups, schema migrations, and monitoring per shard. A hundred shards means a hundred places for a disk to fill.

## Why sharding is not the first move

Sharding makes every query, transaction, backup, and migration more complex. It also fixes one bottleneck while leaving others. Do it when measurement shows one primary cannot keep up, and when simpler options are exhausted.

## Worked example: user id vs created at

A social app has 2 billion posts. Each row is about 500 bytes, so raw data is about 1 TB before indexes and replicas. Peak writes are 20,000 posts per second. One primary is struggling.

Option A: shard by `user_id`.

- Profile timeline: one shard.
- New post: one shard.
- Global recent feed: every shard, then merge.
- Celebrity user: one hot shard.

Option B: shard by `created_at`.

- Global recent feed: one shard, the range for today.
- Profile timeline: every shard, then merge.
- All new writes hit the newest shard.
- Old shards become read-only and easy to archive.

The user timeline is the more common product query, so shard posts by `user_id`. The global feed is served by a separate fan-out feed or a time-ordered index built from the write stream. That is two structures, but each has a clear owner.

## Failure modes

- A hot key overwhelms one shard.
- Range shards grow unevenly as data ages.
- A cross-shard join appears in the request path.
- Resharding saturates the network and raises latency.
- The shard key changes, forcing a row to move.
- A global unique constraint was assumed but never built.

## Curriculum note

This lesson follows a curriculum outline adapted from HelloInterview's public system design topic list. The text, examples, and diagrams are original.

## What to say in an interview

> "Posts are sharded by user_id because the profile timeline is the hot query, and a user's posts stay on one shard. The global recent feed does not have that key, so it reads from a separate time-ordered index built from the post stream rather than fanning out to every shard on each request. I would keep logical shards mapped through a directory so we can move one without rehashing everything. Cross-shard transfers in the ledger use a saga with compensating entries. We would shard only after cache, replicas, and a larger primary failed to keep write latency inside budget."

That states the key, the cost, and the escape hatch.
