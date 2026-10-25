# Design a search autocomplete service

You are designing the typeahead service behind a large consumer search box. As a user types, the product shows a short ranked list of completions. Suggestions must feel instant, reflect what people are searching for now, and still behave well during traffic spikes.

## Scope

Focus on prefix suggestions, ranking, index updates, and serving at scale. The full search engine, result ranking, and ad auction are out of scope, but explain how suggestions hand off to them.

## Requirements

### Functional

- Return up to ten suggestions for a typed prefix.
- Rank suggestions by popularity, recency, locale, and optional personalization.
- Refresh trending suggestions as new queries arrive.
- Support blocklists and editorial overrides.
- Serve suggestions for multiple locales and device types.

### Non-functional

- Suggestion latency should stay under 100 ms at p99.
- The service must remain available during index rebuilds.
- Slightly stale suggestions are acceptable, but results must never be empty because of a deployment.
- Query text is sensitive and should not be retained longer than needed.
- Traffic can spike sharply during live events.

## Scale

- 1.2 billion suggestion requests per day.
- 5 million new or updated query observations per day.
- 1 year of retention for aggregated popularity data.
- Live events can triple traffic for short periods.

## What to produce

1. The API and response contract.
2. The index and data model.
3. A high-level architecture.
4. Two or three deep dives: ranking, index refresh, and hot-prefix serving.
5. The main trade-offs.
6. Failure modes, privacy considerations, and monitoring.
