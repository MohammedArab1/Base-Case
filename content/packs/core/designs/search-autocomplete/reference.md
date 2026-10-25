# Reference design: search autocomplete

This is one reasonable answer. The central tension is freshness versus the latency and operational cost of rebuilding a large prefix index.

## API contract

```text
GET /suggest?q=post&limit=10&locale=en-US&context=web
```

```json
{
  "prefix": "post",
  "suggestions": [
    { "text": "post office", "score": 0.93, "kind": "organic" },
    { "text": "post malone", "score": 0.81, "kind": "trending" }
  ],
  "indexVersion": "2026-10-25T12:00:00Z"
}
```

- The client debounces keystrokes and cancels obsolete requests.
- `limit` is capped at ten. Empty or single-character prefixes may return curated suggestions or nothing.
- Responses carry a short cache TTL for shared prefixes and `Vary` on locale, not on user id.

## Data model and index

A compact prefix trie is a good serving structure:

```text
node: { children: map<char, node>, top: [(text, score)], version }
```

- Each node stores only its top-K suggestions, not every descendant query. K is slightly larger than the API limit so ranking filters still have candidates.
- A separate suggestion table stores display text, locale, blocklist state, and metadata.
- Query observations land in a stream: `{normalizedQuery, locale, count, timestamp, coarseGeo}`.
- Aggregates are recomputed in windows and combined with recency decay, for example `score = count * exp(-ageDays / halfLife)`.

Do not store raw user identifiers with observations. Hash or aggregate at ingestion, and keep only what ranking needs.

## Update pipeline

1. **Ingest:** edge services normalize and sample queries, then publish counts to a stream partitioned by locale and normalized prefix.
2. **Aggregate:** a streaming job maintains rolling counts and detects spikes. A batch job rebuilds full popularity from historical aggregates.
3. **Build:** a builder emits an immutable index version containing the trie and metadata snapshot.
4. **Validate:** run checks for size, empty top-K nodes, blocked terms, and locale coverage.
5. **Publish:** upload the version to object storage and update a pointer. Serving nodes download and warm the new version before switching traffic.
6. **Rollback:** keep the previous two versions. A bad model or index can be rolled back by moving the pointer.

Trending suggestions can be layered on top of the base index at query time from a small, fast-changing overlay. The base index need not be rebuilt for every trend.

## Architecture

```text
Client -> CDN / edge cache -> suggestion service -> in-memory trie shard
                 |                    |                    |
                 |                    +-> trending overlay |
                 |                    +-> personalization  |
                 |                                         |
Query stream -> aggregator -> index builder -> object storage -> serving nodes
```

- **Serving nodes:** hold trie shards in memory, sharded by a stable hash of `(locale, prefix)`. Replicate each shard.
- **Edge cache:** caches popular non-personalized prefixes for a few seconds.
- **Trending overlay:** a small KV store or replicated cache with per-prefix hot entries, refreshed frequently.
- **Personalization:** applied after candidate retrieval, using a bounded user history; personalized responses bypass the shared cache.
- **Editorial service:** blocklists and overrides are versioned and merged last.

## Ranking

Candidate retrieval returns the top-K list for the prefix node. Ranking then blends:

- global popularity with recency decay;
- locale and device affinity;
- exact-prefix match and word-boundary bonuses;
- trending boost with a cap to prevent manipulation;
- personalization from recent, consented history;
- editorial pins and blocklists.

Keep the scoring function deterministic and versioned. Log only aggregate feature contributions for evaluation, not raw queries tied to a user.

## Scale and hot prefixes

1.2 billion requests per day is about 14,000 QPS average, with peaks several times higher.

- The trie shards fit in memory because each node keeps only top-K entries.
- A request touches one shard, so latency is dominated by network and ranking, not a scan.
- Replicate hot shards and use consistent hashing with bounded loads.
- Cache the top few thousand prefixes at the edge; they often account for a large share of traffic.
- For a live event, pre-warm the relevant prefixes and raise the trending overlay refresh rate.
- If one prefix becomes a global hot key, replicate its shard or add a dedicated cache entry rather than splitting the trie mid-flight.

## Trade-offs

- **Precomputed top-K vs query-time search:** precomputation gives predictable latency but increases index size and rebuild time; query-time ranking is more flexible but risks tail latency.
- **Batch vs streaming updates:** batch is cheaper and easier to evaluate; streaming is fresher but harder to deduplicate and protect from spam.
- **Freshness vs availability:** serve the last known good index during a failed build rather than an empty result.
- **Personalization vs privacy and cacheability:** personalized results improve relevance but reduce cache hits and require careful data handling.
- **Global vs per-locale shards:** global shards are simpler but mix languages and ranking rules; locale shards improve relevance at the cost of more replicas.
- **Trie vs inverted index:** a trie is natural for prefixes; an inverted index with edge n-grams can be more flexible for fuzzy matching but uses more space.

## Failure modes and monitoring

- **Bad or empty index:** validate before publish, keep the last good version, and alert on empty-result rate.
- **Shard loss:** route to a replica; if all replicas are down, return a small curated fallback rather than an error.
- **Hot prefix:** detect per-prefix QPS, replicate or cache it, and shed personalization first.
- **Spam or manipulation:** cap trending boosts, require minimum distinct users, and keep an emergency blocklist.
- **Stale trends:** show `indexVersion` in diagnostics and alert when the overlay lags beyond its target.
- **Privacy incident:** aggregate at ingestion, set retention limits, and never log raw query strings with user ids.
- **Monitoring:** p50/p99 latency, empty-result rate, cache hit rate, index age, shard error rate, trending-overlay lag, and per-prefix QPS concentration.
