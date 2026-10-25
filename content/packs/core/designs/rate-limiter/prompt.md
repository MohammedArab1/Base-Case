# Design a rate limiter

You are adding rate limiting to a multi-tenant HTTP API. Clients authenticate with an API key, and different plans have different limits. The limiter must protect the backend without becoming a single point of failure.

## Scope

Focus on request-rate limiting at the API gateway and the service layer. Billing, authentication, and the admin UI are out of scope, but state any assumptions you make about them.

## Requirements

### Functional

- Limit requests per client, API key, or IP according to configurable rules.
- Return HTTP 429 with `Retry-After` and remaining-quota headers when a limit is exceeded.
- Support allowlists, per-plan limits, and short-lived overrides.
- Expose per-key usage metrics for operators and customers.

### Non-functional

- Add only a few milliseconds to the request path.
- Be accurate enough that a small burst above the limit is acceptable, but sustained abuse is not.
- Stay available when the counter store is degraded.
- Apply consistent limits across regions and gateway instances.

## Scale

- 200 million counter updates per day.
- 5 billion limit checks per day.
- Keep one year of aggregate metrics; raw counters expire quickly.

## What to produce

1. The limit key and rule model.
2. The algorithm and its data structures.
3. Where the limiter runs and how it talks to its store.
4. The main trade-offs.
5. Failure modes and monitoring.
