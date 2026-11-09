# Scaling Writes

Most systems scale reads first. Add a cache, add replicas, and the read path relaxes. Writes are harder because every write must be accepted, ordered, made durable, and replicated. When the write path saturates, queues grow, latency climbs, and retries add more load.

_This lesson follows the Common Patterns part of a curriculum structured around the HelloInterview System Design in a Hurry outline. The explanations and examples are original._

## Where the write path fails

A write costs more than a CPU cycle. The database may:

- take a row lock;
- update indexes;
- append to a write-ahead log;
- flush to disk for durability;
- ship the change to replicas.

At high volume, the bottleneck moves. One moment it is fsync latency, the next it is lock contention on a hot row, and later it is replication lag. Measure the whole path, not only query time.

A useful distinction is **throughput** (writes per second) and **latency** (time for one write). Batching improves throughput by spending latency. Say which one the product needs.

## Vertical limits

A bigger primary is a valid first step. More memory holds more of the working set, and a faster disk reduces fsync time.

```text
8 cores, SSD    -> 32 cores, NVMe
one primary     -> one larger primary
```

The ceiling arrives in steps. Cost grows faster than capacity, and one machine remains one failure domain. Vertical scaling buys time; it does not remove the need for a plan.

## Batch and group commit

Each durable write may require a disk flush. If one flush costs 1 ms and the database flushes once per write, the ceiling is about 1,000 writes per second on that device, before any other work.

Group commit collects several writes and flushes them together.

```text
without group commit:  W1 fsync  W2 fsync  W3 fsync  W4 fsync
with group commit:     [ W1 W2 W3 W4 ] one fsync
```

If a batch of 100 writes shares one flush, the same disk can support far more writes. The cost is a small wait while the batch fills. Flush on a size limit or a timer, whichever comes first, so a quiet system does not wait forever.

Batching also applies above the database. An ingest service can collect events for 50 ms and write them in one transaction. Keep the batch idempotent, because a failed batch is retried as a unit.

Trade-off: a larger batch raises tail latency and makes one failure affect more work. Keep batches modest and make retries safe.

## Queues and backpressure

A durable queue between the API and the storage layer absorbs bursts.

```text
clients -> API -> [ durable log ] -> consumer group -> database
```

The queue does not create capacity. If consumers process 20,000 events per second and producers send 30,000, the backlog grows by 10,000 every second. The queue only decides where the pain appears.

Bound the queue and watch the **age** of the oldest item, not only its length. A million small messages may drain in seconds; ten large messages may represent an hour of work.

Backpressure options:

- reject new work with `429` or `503` and a `Retry-After`;
- limit in-flight requests per client;
- slow producers with credits or quotas;
- shed low-value work first;
- scale consumers, if the downstream store can take it.

Load shedding is a feature. A fast rejection protects the work already accepted.

## Partition the write path

When one primary cannot take the write rate, split writes across partitions.

```text
shard = hash(user_id) % N
user 41 -> shard 3
user 82 -> shard 6
```

Choose a key with high cardinality and even access. Sharding by `user_id` spreads writes and keeps a user's data together. Sharding by `status` or `country` creates a few large partitions.

Cross-partition transactions are expensive. Design the boundary so the invariant lives inside one shard. If two rows must change together, they likely belong to the same partition.

## Storage engine write cost

Two common storage layouts charge for writes in different ways.

A **B-tree** updates pages in place and writes a write-ahead log for recovery. Reads are predictable, but random updates touch many pages.

An **LSM-tree** appends writes to a memory table, flushes sorted files to disk, and merges them later through compaction. It turns random writes into sequential writes, which suits write-heavy workloads.

```text
B-tree:   update page -> WAL -> flush
LSM-tree: append memtable -> flush SSTable -> compact
```

Write amplification is the bytes written to disk per logical byte of data. An LSM-tree may write the same record several times as it moves through levels. Compaction consumes disk bandwidth and CPU later, sometimes during peak traffic. B-trees have their own amplification from page updates and WAL.

Pick based on the workload, then watch compaction lag and disk throughput. A write-heavy design that ignores compaction is only deferring the bottleneck.

## Hot keys and monotonic IDs

Even a well-sharded system can concentrate writes on one key. A celebrity account, a flash sale, or a single counter can overload one partition while the rest sit idle.

Options:

- split a counter into N sub-counters and sum them on read;
- serialize updates for one key through a queue;
- give the hot key a dedicated partition or service;
- cache the value and write less often, if the product allows it.

Identifier choice matters too. A purely sequential primary key sends every insert to the same B-tree tail. A random UUID spreads inserts but hurts locality. Time-ordered IDs such as UUIDv7 or ULIDs offer a middle ground, though a timestamp prefix can still create a hot range under extreme write rates.

The right key balances distribution, locality, and the queries the product needs.

## Idempotent consumers and read-your-writes

Async writes change the user experience. The API should return `202 Accepted` with a job or event ID, and a status endpoint should report progress.

Every producer retry and consumer redelivery needs an idempotency key or a natural unique ID. Store it with the result, or enforce a unique constraint. Deduplication is cheaper than explaining a duplicate charge.

Async writes also create a read-your-writes gap. A user posts a comment, the write lands in a queue, and the next read hits a replica that has not seen it. Fix this with one of:

- route the user's reads to the primary for a short window;
- return a version or sequence token with the write and wait for it on read;
- render the optimistic local state until the server confirms.

Do not hide the gap; decide how long it may last.

## Worked example: high-volume event ingest

Suppose a telemetry system receives 50,000 events per second, with bursts to 200,000.

```text
devices -> API (validate, assign event_id)
        -> partitioned log keyed by device_id
        -> consumer group (batch 500 events or 50 ms)
        -> time-series store
        -> query service
```

The API authenticates the device, validates the payload, assigns an `event_id`, and appends to the log. It acknowledges only after the log accepts the write. Consumers batch into the time-series store and record the highest processed offset. A retry replays from that offset, and the store upserts by `event_id`.

Backpressure lives at the API: each device has a rate limit, and the service rejects excess work with `429` when consumer lag crosses a threshold. A single noisy device cannot fill the log. Hot devices are split by adding a suffix to the partition key, then merged at query time.

Capacity is planned from the consumer side. If each consumer handles 10,000 events per second and the burst is 200,000, run at least 20 consumers with headroom. The log retains data long enough to survive a consumer outage.

## What to say in an interview

> "Writes are batched with group commit to amortize fsync, then partitioned by device ID. A durable log absorbs bursts, and consumers batch into the time-series store with idempotent upserts. The queue is bounded, we shed load when consumer lag crosses a threshold, and async writes expose a status endpoint plus a read-your-writes path."

That names the bottleneck, the mechanism, the failure policy, and the user-visible guarantee.
