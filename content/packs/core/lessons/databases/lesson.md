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

## Blobs and metadata

For files, store the bytes in an object store and the metadata in a database.

```text
metadata row: file_id, owner, size, checksum, object_key
object store: bytes at object_key
```

This keeps the database small and lets the object store handle large transfers.

## The storage sentence

> "Links are keyed by short code in a relational table because lookups are by exact key and the record is small. Click events go to an append-only store because they are high-volume writes. Images and exports live in object storage with metadata in the database."

That is a design decision, not a product name.
