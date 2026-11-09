# Numbers to Know

Estimation is a decision tool. A number matters when it changes a component choice. If two designs work at the estimated scale, extra precision does not help.

## Calculate only when it changes a decision

Useful questions include:

- Does the hot set fit in memory, or do reads hit the database every time?
- Can one primary absorb the write rate, or do we need to partition?
- Is the response small enough for one link, or does it need a CDN?
- How many app servers, connections, and workers are in flight at peak?

Skip arithmetic that does not change an answer. "Four nines or five nines" may change the architecture. The third decimal of a QPS estimate usually does not.

A calculation that never changes the design is a distraction. Spend the time on the query path, the failure mode, or the bottleneck instead.

## A modern latency ladder

These are round numbers for 2020s hardware. They are not guarantees, but they keep a design in the right order of magnitude.

```text
L1 cache hit                  ~1 ns
main memory access            ~100 ns
NVMe SSD random read          ~50-100 us
same-host TCP round trip      ~50-100 us
same-datacenter round trip    ~0.5 ms
same-region cross-AZ trip     ~1-2 ms
spinning disk seek            ~5-10 ms
cross-continent round trip    ~100-200 ms
```

Two consequences:

- A chain of ten same-datacenter calls adds about 5 ms, which is often fine.
- Three cross-continent calls add roughly 450 ms before any real work, which is not.

Put data near the reader when the speed of light is the problem. Put fewer hops in the request path when the budget is tight.

## Rough capacity ranges

These are starting points for one modern node. Measure the real workload before committing.

```text
app server (stateless API)     ~1,000-10,000 simple requests/s
                               ~100-1,000 requests/s with heavy work per request
Redis / in-memory cache        ~100,000+ operations/s, sub-millisecond
relational primary (SSD)       ~5,000-50,000 simple reads/s
                               ~1,000-10,000 writes/s
                               much less for joins and large transactions
message queue cluster          ~100,000-1,000,000 small messages/s
                               per-partition throughput is lower
object storage                 effectively unlimited capacity
                               ~10-100 ms to first byte, high durability
```

The ranges are wide because the workload matters more than the product name. A "read" can be a primary-key lookup or a five-table join. A "write" can be one row or a transaction that updates ten indexes. State which one you mean.

Treat these as planning envelopes. If a benchmark disagrees with the range, trust the benchmark for that workload, and keep the range as a sanity check.

## Read/write ratio and peak factor

```text
read:write ratio
  social feed, catalog, profile     10:1 to 100:1
  collaboration, presence updates   around 1:1
  payment ledger                    write-heavy, with reads for audit
```

Peak traffic is not average traffic. Consumer products often peak at 2-5x average. Live events, flash sales, and scheduled jobs can be 10x or more.

```text
average QPS = daily actions / 86,400
peak QPS    = average QPS * peak factor
```

Design for peak, then check that the average is not wasteful.

Write-heavy systems often need batching, queueing, or partitioning by write key. Read-heavy systems usually benefit more from caching and replicas.

## Storage growth

```text
raw bytes/day   = writes/day * bytes per record
raw bytes/year  = raw bytes/day * 365
total           = raw bytes/year * replicas * (1 + index overhead)
```

Example:

```text
2,000,000 writes/day * 1 KB = 2 GB/day
2 GB/day * 365              = 730 GB/year
* 3 replicas                = 2.2 TB/year
+ 25% for indexes           = 2.7 TB/year
```

Retention changes the answer. Keeping 30 days instead of a year cuts this by more than 90%. Compression can cut text and logs by 2-5x. Backups and snapshots add more.

## Little's Law

Little's Law links concurrency, throughput, and latency.

```text
L = lambda * W

L      = items in the system
lambda = arrival rate, items per second
W      = time in the system, seconds
```

Example: 5,000 requests per second with 50 ms average latency.

```text
L = 5,000 * 0.050 = 250 requests in flight
```

That is the number of workers, connections, or threads you need on average. At peak, use peak QPS. Near saturation, latency rises, so the same throughput needs far more concurrency. That is why a pool sized for the average collapses during a burst.

The law assumes a stable system. If arrivals exceed capacity, the queue grows without bound and the average latency stops being a useful planning number.

## Worked example: cache, shard, or add servers

Assume a news product:

```text
20,000,000 daily active users
20 feed reads per user per day
2 posts per user per week
feed response 50 KB
```

Reads:

```text
20,000,000 * 20 = 400,000,000/day
400,000,000 / 86,400 ≈ 4,600/s average
* 3 peak ≈ 14,000/s
```

Bandwidth:

```text
14,000 * 50 KB ≈ 700 MB/s ≈ 5.6 Gbps at peak
```

Storage:

```text
20,000,000 * 2 / 7 ≈ 5.7M posts/day
5.7M * 2 KB ≈ 11 GB/day raw
11 GB * 365 ≈ 4 TB/year raw
* 3 replicas * 1.3 index ≈ 16 TB/year
```

Decisions:

- 14,000 feed reads per second is too much for one primary without help. Cache the hot feed pages and add read replicas.
- 5.6 Gbps of responses is a CDN or edge cache problem, not a database problem.
- 16 TB per year fits one large primary for now. There is no storage reason to shard yet.
- If writes were 50,000 posts per second, the write path would force partitioning even though storage is small. Throughput and storage are separate tests.

The same system can pass the storage test and fail the write test. Say which constraint is binding.

## Why 2010-era assumptions mislead

Old rules of thumb assume spinning disks, 1 Gbps links, small memory, and a handful of cores. Modern hardware changes the constants:

- NVMe reduces random-read cost by orders of magnitude.
- 10-100 Gbps networks make bandwidth less often the first limit.
- 64-core servers and hundreds of GB of memory are ordinary.
- Managed caches and object stores absorb workloads that once needed custom systems.

Some things do not change: cross-continent latency, fsync cost, replication lag, and the price of coordination. Use modern numbers for capacity, and keep the old caution about distance and durability.

## What numbers to carry

```text
86,400 seconds/day
2-5x peak factor
1 KB * 1M ≈ 1 GB
1 MB/s ≈ 86 GB/day
concurrency = throughput * latency
3 replicas, plus 20-50% for indexes
same-AZ ~1 ms, cross-continent ~150 ms
```

## Curriculum note

This lesson follows a curriculum outline adapted from HelloInterview's public system design topic list. The text, examples, and diagrams are original.

## What to say in an interview

> "At 20 million daily users and 20 reads each, that is about 4,600 reads per second on average and 14,000 at 3x peak. At 50 KB per feed response, peak egress is about 5.6 Gbps, so the feed goes through a CDN or edge cache. Posts add about 11 GB per day raw, or 16 TB per year with replicas and indexes, which one primary can hold. The read rate is the binding constraint, so I would add cache and replicas before considering shards. If writes reached tens of thousands per second, the write path would change the plan."

That uses numbers to rule options out and choose the next component.
