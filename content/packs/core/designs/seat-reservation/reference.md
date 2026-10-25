# Reference design: seat reservation

This is one reasonable answer. The essential property is that the database, not a cache or an application-level check, decides who owns a seat.

## API surface

```text
GET  /events/{eventId}/seats
POST /holds                  { eventId, seatIds[], idempotencyKey }
DELETE /holds/{holdId}
POST /reservations/{holdId}/confirm { paymentToken, idempotencyKey }
GET  /reservations/{reservationId}
POST /reservations/{reservationId}/cancel
```

- `GET /seats` returns the current seat state plus an `ETag` or version.
- `POST /holds` returns `201` with a hold id and `expiresAt`, or `409` naming the seats that are no longer available.
- Confirm and cancel accept idempotency keys. Repeating the same key returns the original result rather than charging twice.

## Data model

```text
events(id, venue_id, starts_at, status)
seats(id, event_id, section, row, number, status, held_by_hold_id, version)
holds(id, event_id, user_id, status, expires_at, created_at)
hold_seats(hold_id, seat_id)              -- unique (seat_id) while active
reservations(id, hold_id, user_id, status, total_cents, created_at)
payments(id, reservation_id, provider_ref, status, amount_cents, idempotency_key)
outbox(id, topic, payload, published_at)
audit_log(id, entity_type, entity_id, from_state, to_state, actor, created_at)
```

The key constraint is a partial unique index on active seat ownership:

```sql
CREATE UNIQUE INDEX one_active_owner
ON hold_seats (seat_id)
WHERE released_at IS NULL;
```

Sold seats are copied into the reservation's seat rows and marked sold in `seats` inside the same transaction. A cache may mirror availability, but it is never authoritative.

## Hold flow

1. Validate the event is on sale and the seat count is within the per-user limit.
2. Start a transaction.
3. Select the requested seats `FOR UPDATE` in ascending seat-id order to avoid deadlocks.
4. Reject if any seat is not `available`.
5. Update those seats to `held`, insert the hold and `hold_seats` rows, and commit.
6. Emit an outbox event so the seat-map cache and expiry worker learn about the hold.

The unique index is the final backstop if two transactions race. The loser retries or returns `409`.

## Expiry

An expiry worker claims due holds with `SELECT ... FOR UPDATE SKIP LOCKED` or a lease table, marks the hold expired, releases its seats, and writes an outbox event. Every step is idempotent: releasing an already released seat is a no-op. The worker can run on several replicas because the lease prevents duplicate work.

Do not rely on a TTL cache for expiry; caches are an optimization, not a scheduler. Show the countdown in the UI from the server-provided `expiresAt`, and refresh on reconnect.

## Confirmation and payment

Confirmation is a short saga:

1. Load the hold, verify it is active and not expired, and verify the user owns it.
2. Create a payment record in `pending` with the idempotency key.
3. Request authorization from the payment provider outside the database transaction.
4. On authorization, open a transaction, re-check the hold and seat ownership, mark seats `sold`, insert the reservation, and mark the payment `authorized`.
5. Commit, then capture or settle payment. Publish a confirmation event.
6. On decline or timeout, leave the hold active until its natural expiry unless the provider reports a definitive failure.

If the provider times out, the safe default is to keep the hold and reconcile later using the provider reference. Never release a seat that may have been charged. A reconciliation job matches `pending` payments with provider state and resolves each one idempotently.

## Architecture

```text
Clients -> API gateway -> reservation service -> PostgreSQL (seat + hold + reservation)
                                |                       |
                                +-> seat-map cache <---+ outbox -> cache invalidator
                                |
                                +-> payment worker -> payment provider
                                |
                                +-> expiry workers (leased)
```

- **Reservation service:** owns all state transitions and validates requests.
- **PostgreSQL:** primary source of truth, partitioned or sharded by `event_id`.
- **Seat-map cache:** stores only public availability; invalidated by outbox events with a short TTL as a safety net.
- **Payment worker:** isolates slow provider calls from the transactional path.
- **Expiry workers:** lease-based and horizontally scalable.

## Scale

Five million writes per day is roughly 60 per second on average, but a hot on-sale can exceed that by two orders of magnitude. Two hundred million reads per day is about 2,300 QPS average.

- Serve seat-map reads from a read replica or cache, with a short TTL and event-version checks.
- Shard by `event_id` so one popular event does not contend with unrelated events.
- Keep transactional writes on the primary; do not route hold or confirm traffic to replicas.
- For a single white-hot event, serialize claims per seat range or use a per-event queue. A waiting room can smooth admission before requests reach the database.
- Batch cache invalidation per event to avoid a write storm during an on-sale.

## Trade-offs

- **Database constraint vs distributed lock:** the unique index is simple, durable, and correct under failover; a Redis lock is faster but must handle lock expiry and split-brain. Use the database as the authority and use Redis only for admission control.
- **Pessimistic locking vs optimistic retries:** row locks are predictable for small seat groups; optimistic version checks avoid lock waits but create retry storms under contention. Lock seats in a fixed order to avoid deadlocks.
- **Synchronous vs asynchronous payment:** synchronous confirmation is simpler to reason about but couples availability to the provider. A saga keeps the UI responsive but needs reconciliation.
- **Cache freshness vs load:** longer TTLs reduce read load but show stale seats. Show "availability is not guaranteed until hold" and make the hold authoritative.
- **Seat-level rows vs availability counters:** rows enable exact ownership and audit; counters are cheaper but cannot answer "which seat?" and are hard to repair.

## Failure modes and monitoring

- **Payment provider outage:** hold remains active; confirmation retries or expires. Alert on pending-payment age and provider error rate.
- **Expiry worker crash:** holds remain longer than intended; lease expiry lets another worker take over. Alert on overdue holds and worker lag.
- **Cache outage or stale data:** fall back to database reads for the seat map; holds still work.
- **Database failover:** in-flight transactions fail and are retried with the same idempotency key. The unique constraint prevents double sale after recovery.
- **Duplicate confirm:** idempotency table returns the first result; provider charges are matched by key.
- **Clock skew:** store expiry as an absolute timestamp from the database, not from application hosts.
- **Monitoring:** hold success rate, conflict rate, hold-to-confirm conversion, pending-payment age, overdue holds, seat-map cache hit rate, and double-sale invariant checks.
