# Design a seat reservation service

You are designing the booking backend for a ticketed venue. Customers open an event, inspect a seat map, hold a few seats while they pay, and receive a confirmed booking. The venue cannot afford to sell a seat twice, and popular on-sales create extreme bursts of traffic.

## Scope

Focus on browsing, holding, confirming, cancelling, and releasing seats. The event catalog, user accounts, pricing rules, and the payment provider's internals are out of scope, but state the assumptions you make about them.

## Requirements

### Functional

- Browse events and a live seat map with availability.
- Hold one or more seats for a short, visible expiry window.
- Confirm a reservation with payment and issue a booking.
- Support cancellation and refunds according to the event policy.
- Release expired holds automatically and publish every state change.

### Non-functional

- Never sell the same seat twice, even during a traffic spike.
- Seat-map reads should stay fast under heavy read traffic.
- A hold must expire reliably within a few seconds of its deadline.
- A payment-provider outage must not corrupt seat state or lose a paid booking.
- Every hold, sale, release, and refund must be auditable.

## Scale

- 5 million hold or reservation writes per day.
- 200 million seat-map and availability reads per day.
- 3 years of retention for bookings and audit records.
- A single popular on-sale can produce 100 times the average traffic for a few minutes.

## What to produce

1. The API surface.
2. The seat, hold, reservation, and payment data model.
3. A high-level architecture.
4. Two or three deep dives: the atomic claim, hold expiry, and payment confirmation.
5. The main trade-offs.
6. Failure modes, monitoring, and a recovery plan.
