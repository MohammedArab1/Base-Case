# Reference design: payment ledger

This is one reasonable answer. The ledger is the source of truth: balances are derived from immutable postings, and external settlement is a separate, retryable process.

## API contract

```text
POST /transfers
  { idempotencyKey, sourceAccount, destinationAccount, amountMinor, currency, reference }

POST /refunds
  { idempotencyKey, originalTransferId, amountMinor, reason }

GET /accounts/{accountId}/balance?currency=USD
GET /accounts/{accountId}/entries?cursor=...
GET /transfers/{transferId}
```

- The idempotency key is required and scoped to the caller. Repeating the same key with the same payload returns the original result; reusing it with a different payload returns `409`.
- Amounts are integer minor units, never floating point.
- A refund references the original transfer and cannot exceed the unrefunded amount.

## Data model

```text
accounts(id, owner_id, type, currency, status)
transfers(id, idempotency_key, status, created_at, provider_ref)
journal_entries(id, transfer_id, sequence, description, created_at)
postings(id, entry_id, account_id, direction, amount_minor, currency)
idempotency_keys(key, caller_id, request_hash, response_body, created_at)
outbox(id, topic, payload, published_at)
reconciliation_runs(id, provider, period_start, period_end, status)
reconciliation_items(id, run_id, provider_ref, ledger_entry_id, status, delta_minor)
```

Invariants:

1. Every journal entry has at least two postings.
2. For each entry and currency, the sum of debits equals the sum of credits.
3. Postings and entries are append-only. Corrections are new entries, not updates.
4. A balance is the sum of postings for an account and currency, optionally cached as a checkpoint.

Use deferred constraints or a stored procedure that inserts the entry and all postings in one transaction, then validates the balanced invariant before commit.

## Commit flow

1. Validate the request, currency, account status, and sufficient funds where required.
2. Look up the idempotency key and request hash inside the transaction.
3. If a matching completed request exists, return its stored response.
4. Insert the transfer, journal entry, postings, idempotency record, and outbox event in one database transaction.
5. Commit. This is the durability point for internal bookkeeping.
6. The outbox worker publishes the settlement request. The provider call happens outside the transaction.

Use `READ COMMITTED` plus row locks on the accounts involved, ordered by account id to avoid deadlocks. For accounts with high write rates, serialize writes for that account through a single partition or a per-account queue. A serializable isolation level is a simpler alternative for low-contention accounts but needs retry handling.

## Settlement

Settlement is at-least-once with an idempotent provider operation:

- The outbox event contains the transfer id and a stable provider idempotency key.
- The settlement worker calls the provider, records the provider reference, and marks the transfer `settled` in a new transaction.
- A duplicate delivery reuses the same provider key, so the provider returns the original result.
- A timeout is ambiguous. Keep the transfer `pending`, retry with the same key, and reconcile later. Never assume a timeout means failure.

If the provider reports a definitive failure, append a reversal entry rather than deleting the original. The original entry remains in history, and the reversal balances the accounts again.

## Reconciliation

1. Import the provider's statement for a period.
2. Match each provider line to a ledger transfer by provider reference and amount.
3. Exact matches are marked reconciled.
4. Missing ledger entries become an exception: create an investigation record, and after review append the correcting journal entry.
5. Missing provider entries are retried or investigated; they may be delayed settlements.
6. Duplicate provider lines are flagged; if the provider actually charged twice, record a refund entry.
7. Close the run with counts and a signed summary.

Reconciliation never edits history. It produces new entries and an audit trail explaining each correction.

## Architecture

```text
Clients -> API -> ledger service -> PostgreSQL (append-only postings, sharded)
                        |                    |
                        +-> idempotency     +-> read replica for history
                        +-> outbox -> settlement workers -> payment provider
                        +-> reconciliation jobs <- provider statements
```

- **Ledger service:** owns validation, transactions, and the balance invariant.
- **PostgreSQL:** primary source of truth, partitioned by account or time; synchronous replication for durability.
- **Outbox:** makes internal commit and external work reliable across the boundary.
- **Settlement workers:** retryable, idempotent, and isolated from the request path.
- **Reconciliation jobs:** batch processes that import statements, match records, and produce exceptions.

## Scale

Fifty million postings per day is about 580 per second average, but payout windows and month-end reconciliation create bursts. Two hundred million reads per day is about 2,300 QPS average.

- Shard by account id so all writes for one account stay on one primary.
- Keep hot-account writes serialized; do not spread one account across shards.
- Derive balances from indexed postings, or maintain a materialized balance with an append-only checkpoint. Verify the cache against postings periodically.
- Serve history from read replicas with cursor pagination; never serve a possibly stale balance from a replica to a write path.
- Batch reconciliation imports and process exceptions offline.
- Archive immutable closed periods to cheaper storage while keeping an auditable index.

## Trade-offs

- **Append-only postings vs mutable balances:** postings are auditable and reconstructable but require aggregation; a mutable balance is fast but easy to corrupt. Keep postings authoritative and treat balances as derived.
- **Strong consistency vs availability:** account-level strong consistency prevents overdrafts and double spending. Cross-region asynchronous replication improves write availability but risks stale balances; route writes for an account to its home region.
- **Synchronous vs asynchronous settlement:** synchronous provider calls simplify the user experience but couple ledger availability to the provider. The outbox and retries decouple them at the cost of eventual settlement.
- **Exactly-once vs idempotency plus at-least-once:** true exactly-once delivery is impractical across a network. Use idempotency keys and stable provider references to make repeated delivery safe.
- **Single database vs distributed ledger:** one database gives strong invariants and simpler reconciliation; sharding is necessary at scale but makes cross-account transfers a distributed transaction. Prefer per-account shards and a coordinated transfer record.
- **Immediate corrections vs period close:** immediate compensating entries keep books current; period close simplifies reporting. Do both: append corrections immediately and lock periods for reporting.

## Failure modes and monitoring

- **Duplicate request:** idempotency record returns the original response; a changed payload is rejected.
- **Provider timeout:** keep the transfer pending and retry with the same key; reconcile by provider reference.
- **Partial settlement:** outbox retries; reconciliation detects missing or extra provider lines.
- **Database failover:** transactions either commit or fail atomically; retries use the same idempotency key.
- **Hot account:** serialize writes, add a queue, and alert on lock wait time.
- **Invariant violation:** run a continuous check that every entry balances and that materialized balances match postings; block new writes for the affected account until resolved.
- **Bad reconciliation import:** validate file hashes and totals, stage the import, and require an explicit close before applying corrections.
- **Monitoring:** posting latency, duplicate-request rate, outbox lag, settlement success rate, unmatched reconciliation items, balance-check failures, and audit-log write failures.
