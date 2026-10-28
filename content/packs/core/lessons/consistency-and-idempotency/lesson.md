# Consistency and Idempotency

Two questions shape most distributed designs:

1. **What must every user see immediately?**
2. **What happens if a request is retried?**

## Consistency is a spectrum

Strong consistency means every read sees the latest completed write. Eventual consistency means replicas converge after some delay.

It helps to name three common patterns.

- **Weak consistency**: after a write, a read may or may not see it. The system makes a best effort. This is acceptable for live presence, voice and video, and multiplayer state where a dropped update is replaced by the next frame.
- **Eventual consistency**: after a write stops, replicas converge, usually within a bounded delay. DNS, email delivery, and feed counters are common examples. The user may see an old value for a moment, but the system heals.
- **Strong consistency**: after a write completes, later reads see it. Transactions and file systems often provide this. It usually costs coordination, latency, or availability during a partition.

None of these labels is a moral ranking. The product decides which one each operation needs.

Between them are practical guarantees:

- **Read-your-writes**: after I write, my own reads see it.
- **Monotonic reads**: I never see an older version after seeing a newer one.
- **Causal consistency**: if A happens before B, everyone sees A before B.

Users notice these more than the abstract label. A user who posts a comment and does not see it on refresh will assume the post failed, even if the system is "eventually consistent."

## CAP without the slogan

CAP says that during a network partition, a distributed system must choose between consistency and availability.

```text
partition: two replicas cannot talk

choice A: refuse reads/writes that cannot be consistent
choice B: serve reads that may be stale
```

Most systems are not "CP" or "AP" all the time. They make different choices per operation. A payment ledger may refuse a write it cannot confirm. A feed may serve a slightly old timeline.

Availability here has a precise meaning: every request receives a response, not necessarily a correct or fresh one. A system that returns an error is not being available in the CAP sense. A system that serves stale data is.

Say which operation needs which guarantee. "The system is strongly consistent" is too broad to be useful.

```text
inventory count      -> strong or refuse the write
view counter         -> eventual or weak
user's own new post  -> read-your-writes
presence indicator   -> weak
```

## Quorums

With `N` replicas, a write to `W` replicas and a read from `R` replicas can overlap when `R + W > N`.

```text
N = 3
W = 2
R = 2

R + W = 4 > 3, so the read set and write set must share a replica
```

More replicas for a write means stronger durability but higher latency. Tune per operation.

## Idempotency

An operation is idempotent if repeating it has the same effect as doing it once.

```text
safe:     set balance = 100
unsafe:   add 100 to balance
```

A retry after a timeout is common. The client does not know whether the first request succeeded.

An **idempotency key** solves this:

```text
client generates key = "order-123-attempt-1"
server stores key + result
retry with same key -> return the stored result
```

The key must be unique per logical operation, and the server must enforce uniqueness atomically. Store a hash of the request as well, so a reused key with a different payload is rejected rather than silently returning the wrong result.

## Payments and bookings

These are the two classic invariants.

**No double charge**:

- a unique idempotency key on the charge request;
- a ledger that records the charge once;
- a state machine that refuses an invalid transition.

**No double booking**:

- a unique constraint on `(seat_id, show_id)`;
- or a transaction that checks and reserves atomically;
- or a single-writer reservation service per seat.

A cache is not a source of truth for these invariants. It can make the happy path fast; the final decision belongs in durable storage.

## Distributed transactions

Two-phase commit coordinates multiple participants, but it is slow and can block when a coordinator fails. Many systems prefer:

- **Sagas**: a sequence of local transactions with compensating actions.
- **Outbox pattern**: write the state change and an event in one local transaction, then publish the event.
- **Single-writer boundaries**: keep the invariant inside one service or partition.

Each approach moves complexity rather than removing it. Say where the complexity went.

## The sentence to practice

> "A seat reservation is strongly consistent at the seat level. The reservation write uses a transaction and a uniqueness constraint, so a retry with the same idempotency key returns the existing reservation instead of creating a second one. Reads of the event page may come from a replica and can lag."

That is a precise guarantee, a mechanism, and an accepted limitation.
