# Data Modeling: Entities and Access Patterns

A data model is not every fact in the business. It is the smallest set of records and keys that serves the queries the system must run. Start with access patterns, then choose the store.

## Find the core entities

Circle the nouns in the requirements: user, order, payment, file, message, seat. Keep four to six entities.

Draw the relationships.

```text
User 1 ---- * Order
Order 1 --- * OrderItem
OrderItem * ---- 1 Product
Order 1 --- 1 Payment
Payment 1 -- * LedgerEntry
```

Cardinality matters. One user has many orders; one order has many items. A many-to-many relationship needs a join record, such as `order_items` or `chat_members`.

Name the invariant each relationship carries. An order total equals the sum of its items. A seat has at most one active reservation. A ledger balances. These rules decide where you need a transaction or unique constraint.

## Write the top queries first

A schema is only good relative to a workload. List the five queries that matter, with a rough rate.

```text
get order by id                    200 /s
list a user's orders, newest first  50 /s
get payment for an order           100 /s
append a ledger entry              200 /s
list recent files for a user        30 /s
```

Each query needs a path: a primary key, a secondary index, or a partition plus a sort key. If a required query has no path, the model is wrong for that workload.

## Normalize first, then denormalize on purpose

Normalization stores each fact once. A customer's name lives in `customers`, so an update cannot leave copies disagreeing.

Denormalization copies a value to make a read cheaper.

```text
normalized:
  orders -> customer_id -> customers.name

denormalized:
  orders.customer_name copied into each order row
```

The read avoids a join. When a name changes, every copy must change or drift.

Two things are often called denormalization:

- **A mutable copy**, such as a cached display name, needs a repair rule when the source changes.
- **A historical snapshot**, such as the unit price at purchase, should not change when the product price changes. Copying it is correct.

A snapshot is a fact with a time. A cache is a duplicate with a repair rule. Denormalize after a measured read problem. A materialized view is a managed version of the same trade: faster reads, more write work, and a refresh rule.

## Primary keys and sort keys

The primary key identifies a row. Prefer a stable, opaque identifier. An email address looks convenient until a user changes it or asks for deletion. Natural keys work only when they never change.

Order matters in a composite key.

```text
orders
  primary key (user_id, created_at, order_id)
```

This key serves "list this user's orders, newest first."

A sort key orders records inside a partition. In a wide-column store, the partition key spreads data and the clustering key sorts inside.

```text
partition key: conversation_id
clustering key: created_at, message_id

query: messages for conversation c-9, newest first
```

The partition key must match the query. Low cardinality such as `status = "active"` concentrates data in one partition. High cardinality spreads load, but a key that does not match the query forces a scan or fan-out.

Sequential IDs are compact and easy to index, but they reveal volume and can create a hot write target. Random IDs spread writes but hurt index locality; time-ordered IDs are a middle ground.

## Match the store to the access pattern

The store follows the queries, not the other way around.

**Relational** fits joins, unique constraints, transactions, and reporting. Orders, payments, reservations, and permissions usually start here.

**Document** fits an aggregate read and written as a unit. An order with line items can be one document when fetched together. A ledger needs append-only rows, not one mutable document.

**Key-value** fits exact-key lookup at high scale. A short code to URL mapping, a session, or a feature flag fits well. Another query field needs another index or store.

**Wide-column** fits high write volume with reads by a known partition and sort order. Chat messages, events, and time-series readings are common.

**Search index** fits full-text and relevance queries. It is usually a secondary view, not the only copy.

**Object store** fits file bytes. Keep metadata in a database and the blob behind an opaque key.

A system can use more than one store. The cost is more moving parts and weaker consistency.

## Hot fields and contention

Some fields draw concurrent writers: a like counter, inventory for a popular item, or one seat's status.

```text
one row: seat 14C
  1000 buyers -> read status -> write held
```

A single row serializes writes. Options:

- Use an atomic conditional update: `UPDATE ... WHERE status = 'open'`.
- Add a unique constraint on the active reservation.
- Shard a counter and sum the parts.
- Bound contention with a short hold window.

The database needs a rule that prevents double booking; an application check followed by a write is a race unless a constraint or transaction closes it.

## Transactions and invariants

A transaction groups writes that must succeed or fail together.

```text
BEGIN
  insert order
  insert order items
  insert payment authorization
COMMIT
```

Use a transaction when a violation would be visible and expensive: money moved without a matching entry, a seat booked twice, an order without items.

Across services, a single transaction may be unavailable. Use idempotent operations, a saga, or a transactional outbox so the database change and event publish agree. State what can be inconsistent.

## A worked order and payment model

```text
orders
  order_id        primary key
  user_id         not null
  status          pending | paid | cancelled
  total_cents     integer
  created_at      timestamp

order_items
  order_id        primary key part
  line_no         primary key part
  sku             string
  quantity        integer
  unit_cents      integer   price snapshot

payments
  payment_id      primary key
  order_id        unique
  idempotency_key unique
  status          authorized | captured | failed
  amount_cents    integer

ledger_entries
  entry_id        primary key
  payment_id      index
  account         string
  direction       debit | credit
  amount_cents    integer
  created_at      timestamp
```

Why this shape:

- `order_items` is keyed by `(order_id, line_no)` for one range read.
- `unit_cents` is a snapshot; a later price change must not rewrite old orders.
- `payments.order_id` is unique unless partial payments are allowed.
- `ledger_entries` is append-only. A correction is a new entry, not an edit.
- An index on `orders(user_id, created_at)` serves the order list.

Invariants:

- Line items sum to the order total; a captured payment never exceeds it.
- Every payment has balanced ledger entries.
- A retried payment with the same key returns the same result.

Failure modes:

- The payment succeeds but the order update fails. A transaction or outbox closes the gap.
- The same payment request arrives twice. A unique idempotency key stops the duplicate.
- A ledger entry is edited. Append a correction.

## A short file metadata example

File bytes belong in an object store. The database holds metadata.

```text
files
  file_id      primary key
  owner_id     index with updated_at
  name         string
  size_bytes   integer
  checksum     string
  blob_key     string
  version      integer
  updated_at   timestamp

permissions
  file_id      primary key part
  user_id      primary key part
  role         owner | editor | viewer
```

The list query uses `(owner_id, updated_at)`. Sharing uses the permissions table. Checksums support deduplication; ownership and retention still need rules. Uploads write the blob, then the metadata row; a crash can leave an orphan blob, so cleanup is part of the model.

## Schema evolution

Schemas change while data is live.

```text
expand:   add a nullable column or new field
migrate:  backfill in batches, dual write if needed
contract: remove the old column after readers stop using it
```

Avoid a destructive rename in one step. Avoid a long transaction that locks a large table. Version event payloads so old consumers can keep reading. Give new fields a default and a plan for old rows.

## What not to model in an interview

Do not draw the entire company schema. Skip audit tables, soft-delete flags, internationalization, and analytics star schemas unless the prompt depends on them.

Cover:

- four to six entities;
- the relationships that carry invariants;
- the keys and indexes for the top queries;
- one or two transactions;
- the store choice and why.

Say what you left out. A small model with clear access paths beats a large model with no query behind it.

## What to say in an interview

> "The core entities are orders, order items, payments, and ledger entries. Orders are read by ID and listed by user and creation time, so the orders table is keyed by order ID with an index on user and created time. Items are keyed by order and line number. Unit price is copied as a purchase snapshot. Payments carry a unique idempotency key, and ledger entries are append-only so history is never rewritten. The payment and order status changes run in one transaction, with an outbox for downstream events."

That names the entities, the access paths, the denormalization, and the invariant.
