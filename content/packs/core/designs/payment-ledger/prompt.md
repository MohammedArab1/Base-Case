# Design a payment ledger

You are designing the ledger behind a payments product. Every charge, refund, transfer, and provider fee must be recorded in a way that can be audited years later. A retried request must not move money twice, and a provider outage must not leave the books inconsistent.

## Scope

Focus on recording money movement, balances, idempotency, settlement, and reconciliation. Card-network tokenization, fraud scoring, and tax calculation are out of scope, but state the assumptions you make about the provider interface.

## Requirements

### Functional

- Record payments, refunds, and transfers as double-entry journal entries.
- Expose account balances and an immutable transaction history.
- Accept retried requests without moving money twice.
- Settle with external payment providers and banks.
- Reconcile provider statements and handle unmatched entries.

### Non-functional

- A committed journal entry must never lose or duplicate money.
- Every transaction must balance: total debits equal total credits.
- Writes for one account should be strongly consistent.
- The ledger must remain auditable for seven years.
- External provider outages must not block internal bookkeeping.

## Scale

- 50 million journal postings per day.
- 200 million balance and history reads per day.
- 7 years of retention with immutable audit records.
- Month-end and payout periods create bursts of reconciliation traffic.

## What to produce

1. The API and idempotency contract.
2. The double-entry data model and invariants.
3. A high-level architecture.
4. Two or three deep dives: commit, settlement, and reconciliation.
5. The main trade-offs.
6. Failure modes, audit controls, and monitoring.
