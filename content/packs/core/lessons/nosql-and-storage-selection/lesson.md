# NoSQL and Choosing a Store

The database question sounds like "which database is best?" The useful question is "which store fits these access patterns?" Start with the queries, then choose the tool.

## Write the queries first

Before comparing products, list the handful of operations that matter.

```text
1. get a link by short code             ~1,000 /s, must be fast
2. create a link                         ~10 /s, must be durable
3. list a user's links, newest first     ~5 /s, paginated
4. append a click event                  ~5,000 /s, can be delayed
```

That list already suggests different stores for different jobs. One database does not have to serve every access pattern.

## The NoSQL families

NoSQL is a label for several different models. They are not interchangeable.

### Key-value

The model is a dictionary: a key maps to a value.

```text
"session:8f2a" -> { userId: 42, expiresAt: ... }
"link:a7K2"    -> "https://example.com/..."
```

Reads and writes by exact key are fast and simple. There is little query language: if you need to search by another field, you usually build another index or another store.

Good for sessions, counters, feature flags, and caches.

### Document

A document stores a whole object, often as JSON, with fields that can vary between records.

```text
{
  "orderId": "o-123",
  "customer": { "id": "c-9", "name": "Sam" },
  "items": [ { "sku": "A1", "qty": 2 } ],
  "status": "paid"
}
```

Document stores are a good fit when the document is the natural unit of reading and writing. They usually provide atomicity per document, not across many documents. Cross-document transactions exist in some systems but are more limited than in a relational database.

Good for content records, product catalogs, and user profiles whose shape changes.

### Wide-column

A wide-column store organizes data by a row key and sorted columns. It is built for very large write volumes and range reads by a known key.

```text
row key: sensor-17
  columns sorted by timestamp:
    2026-10-01T00:00 -> 21.4
    2026-10-01T00:01 -> 21.5
    2026-10-01T00:02 -> 21.6
```

Good for time-series data, event logs, and messages read in time order. The access pattern must be known in advance; ad hoc queries are limited.

### Graph

A graph store treats records as nodes and relationships as edges.

```text
(ana) --follows--> (ben)
  |                    |
  +--likes--> (post) <--+
```

Graph databases are useful when relationships are the main query: friend-of-friend, recommendations, permission chains, and fraud rings. For simple lookups, a relational table with an index is often enough.

### Search index and object store

Two more storage types sit beside the four families:

- A **search index** handles full-text search and ranking. It is usually a secondary copy, not the source of truth.
- An **object store** holds blobs such as images, videos, and exports. Keep metadata in a database and bytes in the object store.

```text
metadata row: file_id, owner, size, checksum, object_key
object store: bytes at object_key
```

## Denormalization

Normalization removes duplication. Denormalization puts some duplication back to make reads cheaper.

```text
normalized:
  orders -> customer_id -> customers

denormalized:
  orders with customer_name copied into each order row
```

The read no longer needs a join. The cost is that a customer rename must update every copied row, or the copies will disagree.

Denormalize when a read path is measured and the join is the bottleneck. Keep one owner for each fact, and decide how copies are repaired. A materialized view is a managed form of the same idea.

## SQL or NoSQL

Choose SQL when:

- records have clear relationships and joins;
- multiple rows must change atomically;
- constraints must be enforced by the database;
- queries are not fully known in advance;
- the team benefits from mature tooling and familiar operations.

Choose a NoSQL store when:

- the access pattern is known and narrow;
- the data shape changes often;
- the write volume or data size exceeds what one relational primary can handle;
- the data is naturally a key-value lookup, a document, an event stream, or a graph.

NoSQL does not remove the need to partition, replicate, and plan for failure. It moves some of that work into the application.

## ACID and BASE

Relational systems are usually described by **ACID**: atomicity, consistency, isolation, durability.

Many distributed NoSQL systems are described by **BASE**:

- **Basically available**: the system keeps responding.
- **Soft state**: copies may change without new input, as replication catches up.
- **Eventual consistency**: copies converge if writes stop.

BASE is not a free pass. Decide which invariant the product cannot break. A double charge or a double-booked seat is not an acceptable "eventual" outcome.

## Replication, federation, and sharding

These are different ways to spread data.

```text
replication:  same data, multiple copies

federation:   split by function

  [ users DB ] [ billing DB ] [ content DB ]

sharding:     split one data set by key

  [ users 0-999 ] [ users 1000-1999 ] [ users 2000-... ]
```

- **Replication** improves read capacity and availability. It does not reduce the size of one logical data set.
- **Federation** splits by business function. Each database is smaller and can be tuned separately. Cross-function joins become application work.
- **Sharding** splits one data set by a partition key. Cross-shard joins and transactions become expensive.

A good shard key has high cardinality, even distribution, and alignment with the most common query. A bad key creates a hot shard or forces every query to fan out.

## SQL tuning basics

When a relational query is slow, measure before changing anything.

1. Read the query plan. Is it scanning a table or using an index?
2. Check the predicate and sort order against the index columns, remembering that the leftmost columns matter.
3. Avoid `N+1` queries: fetch related rows in one batch.
4. Select only the columns you need.
5. Paginate large result sets with a stable cursor.
6. Keep large blobs out of row storage.
7. Benchmark with realistic data sizes.

An index speeds reads and costs write time, storage, and memory. Add it for a specific query, then verify the plan changed.

## Worked choices

- **Short links**: exact-key lookups fit a key-value store or a relational table with a unique index. Click events are append-only and can live separately.
- **Payments**: a relational store with transactions and a unique idempotency key protects the no-double-charge invariant.
- **Seat reservations**: a uniqueness constraint on `(seat, show)` or a single-writer reservation boundary prevents double booking.
- **Social feed**: relationships may fit a graph, while per-user feed entries are denormalized for fast reads.
- **Time-series metrics**: a wide-column store keyed by device and sorted by time fits the write volume and range reads.

## What to say in an interview

> "Link lookups are exact-key reads, so a key-value store or a relational table with a unique index both fit. The payment ledger stays relational because a transfer needs multi-row atomicity and a uniqueness constraint. Feed entries are denormalized per user because reads dominate. Click analytics is append-only and queried in batches, so it does not belong in the primary transactional store."

That connects each choice to an access pattern and an invariant.
