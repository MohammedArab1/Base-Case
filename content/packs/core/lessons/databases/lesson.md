# Databases, Indexes, Replication, and Sharding

Storage decisions follow access patterns. Ask what the system reads and writes before asking which database to use.

## What kind of data is it?

- **Relational**: strong schemas, joins, transactions. A good default for money, bookings, and anything with invariants across rows.
- **Document**: flexible records fetched as a unit. Useful when the document is the natural boundary.
- **Key-value**: simple lookups at very high scale. Great for sessions, counters, and caches.
- **Wide-column**: huge write volumes with access by a known key. Common for time-series and event data.
- **Search index**: full-text and relevance ranking. Usually a secondary system, not the source of truth.
- **Object store**: blobs such as images and files. Do not put large binaries in a row database if you can avoid it.

The choice is not a badge. It is a fit to the queries.

## Indexes

An index is a sorted structure that lets the database jump to matching rows instead of scanning.

```text
without index:
scan every row -> find code = "a7K2"

with index:
look up "a7K2" in the index -> follow the pointer to the row
```

A B-tree index supports equality and range queries in `O(log n)`.

```text
index on (user_id, created_at):
  WHERE user_id = 42 ORDER BY created_at DESC  -> fast
  WHERE created_at > ...                       -> may not use this index
```

The leftmost columns matter. A composite index is not a magic "speed up everything" switch.

Indexes cost:

- storage;
- write time, because every write updates the index;
- memory, because hot index pages compete with data pages.

Add an index because a query needs it, then verify with the query plan.

## Transactions

A transaction groups operations so they succeed or fail together.

```text
BEGIN
  debit account A
  credit account B
COMMIT
```

The classic guarantees are ACID: atomicity, consistency, isolation, durability. Isolation levels trade strictness for concurrency. Know what your system needs:

- A payment transfer needs atomicity and appropriate isolation.
- A view counter can tolerate lost updates.
- A seat reservation needs a uniqueness constraint or a transaction to prevent double booking.

## Replication

A primary handles writes and replicates to followers.

```text
          writes
            |
            v
        +--------+
        | primary|
        +--------+
          |    |
          v    v
      replica replica
          ^
        reads
```

Benefits:

- more read capacity;
- a failover target;
- geographic locality.

Costs:

- replication lag;
- failover complexity;
- more storage.

If a user writes a value and immediately reads it, a lagging replica may return the old value. Route that read to the primary or use a read-your-writes token.

### Master-master replication

Some systems let more than one node accept writes.

```text
        writes          writes
          |               |
          v               v
      [ master A ] <--> [ master B ]
```

Both masters serve reads and writes and replicate to each other. If one is unavailable, the other can continue accepting writes. That improves write availability, but it creates conflicts: two clients can update the same record at the same time.

Master-master needs a conflict rule. Common approaches are last-write-wins with a clock, per-record ownership so only one side writes a given key, or an application-level merge. Each choice has a cost. Last-write-wins can silently discard a valid update; ownership can make some writes slower; merges can be complex.

Most master-master systems are either loosely consistent or add write latency to synchronize. Say which one you chose and what happens to concurrent writes.

## Sharding

When one primary cannot hold or write the data, split it.

```text
shard 0: user_id % 4 == 0
shard 1: user_id % 4 == 1
shard 2: user_id % 4 == 2
shard 3: user_id % 4 == 3
```

The partition key determines everything.

- Good key: high cardinality, even distribution, matches common queries.
- Bad key: low cardinality, hot values, or a key that forces every query to fan out.

Cross-shard joins and transactions are expensive. Design around them or accept the cost explicitly.

## Federation

Federation splits databases by business function instead of by key.

```text
single database          federated databases
  [ users     ]            [ users DB ]
  [ billing   ]            [ billing DB ]
  [ content   ]            [ content DB ]
```

Each database holds a smaller data set and can be tuned, replicated, and scaled for its own workload. There is no single primary serializing every write, so independent functions can write in parallel.

The cost is application routing: the code must know which database a query belongs to. Joins across functions become application work or a data pipeline. Federation is a poor fit when the schema is one huge, tightly connected whole.

Federation and sharding are different. Federation splits by function; sharding splits one data set by a partition key. Both reduce the load on a single database, but only sharding distributes one logical table.

## Denormalization

Normalization removes duplicate facts. Denormalization adds some duplication back to make reads cheaper.

```text
normalized:
  orders -> customer_id -> customers

denormalized:
  orders with customer_name copied into each row
```

The read no longer needs a join. The cost is write work: a customer rename must update every copied row, or the copies will disagree.

Denormalize when a read path is measured and the join is the bottleneck. Keep one authoritative copy of each fact, decide how copies are repaired, and accept that a repair may lag. A materialized view is a managed version of the same trade.

Most systems read far more than they write. That makes denormalization attractive, but it is easy to overdo. Add it after measurement, not before.

## SQL tuning

When a query is slow, measure before changing the schema.

1. Read the query plan. Is it scanning a table or using an index?
2. Match the index to the predicate and sort order, remembering that the leftmost columns matter.
3. Avoid `N+1` queries by batching related reads.
4. Select only the columns you need.
5. Paginate with a stable cursor instead of a large offset.
6. Keep large blobs out of row storage.
7. Benchmark with realistic data sizes.

An index speeds reads and costs write time, storage, and memory. Add an index for a specific query, then verify the plan changed. More indexes are not automatically better.

## Blobs and metadata

For files, store the bytes in an object store and the metadata in a database.

```text
metadata row: file_id, owner, size, checksum, object_key
object store: bytes at object_key
```

This keeps the database small and lets the object store handle large transfers.

## The storage sentence

> "Links are keyed by short code in a relational table because lookups are by exact key and the record is small. Click events go to an append-only store because they are high-volume writes. Billing lives in its own federated database so it can use stronger transactions without competing with link traffic. Images and exports live in object storage with metadata in the database."

That is a design decision, not a product name. The NoSQL lesson goes deeper on document, wide-column, graph, and search stores, and on how to choose between them.
