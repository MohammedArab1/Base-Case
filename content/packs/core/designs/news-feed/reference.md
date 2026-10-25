# Reference design: news feed

This is one reasonable answer. The central decision is how much work to do at write time versus read time.

## API

```text
GET  /v1/feed?cursor=<opaque>&limit=20
  -> 200 { items: [{ postId, authorId, body, media, createdAt, rank, counts }], nextCursor }

POST /v1/posts
  { body, mediaIds, idempotencyKey }
  -> 201 { postId, createdAt }

POST   /v1/follows/:userId
DELETE /v1/follows/:userId
POST   /v1/posts/:postId/likes
DELETE /v1/posts/:postId/likes
```

Cursors encode the last seen `(rank, postId)` so new posts do not shift pages. `GET /v1/feed?since=<cursor>` powers the new-posts indicator.

## Data model

**Posts** (partitioned relational table or wide-column store):

| Field        | Notes                            |
| ------------ | -------------------------------- |
| `post_id`    | Time-ordered id.                 |
| `author_id`  | Indexed for author timelines.    |
| `body`       | Text.                            |
| `media`      | References to object storage.    |
| `created_at` | Server time.                     |
| `deleted_at` | Soft delete for fan-out cleanup. |

**Follows** (social graph):

| Field         | Notes                    |
| ------------- | ------------------------ |
| `follower_id` | Partition key.           |
| `followee_id` | Clustering key.          |
| `created_at`  | When the follow started. |

Keep a reverse index for follower counts and fan-out.

**Feed entries** (precomputed, per user):

| Field         | Notes                              |
| ------------- | ---------------------------------- |
| `user_id`     | Partition key.                     |
| `rank`        | Sort key from the ranking service. |
| `post_id`     | Candidate post.                    |
| `inserted_at` | For cleanup and pagination.        |

**Counters:** likes and comments are aggregated asynchronously into a counter table or cache. The post row is not updated synchronously.

## Fan-out strategy

Use a hybrid model:

- **Normal accounts** (for example, fewer than 10k followers): fan out on write. When a post is created, enqueue a job that inserts a feed entry for each follower.
- **Celebrity accounts:** do not fan out. Store the post in the author timeline and merge it into the reader's feed at read time.
- **Feed read:** load the precomputed feed, merge recent posts from followed celebrities, then apply ranking and filtering.

This keeps write amplification bounded while keeping reads fast for the vast majority of users.

## Ranking

Ranking runs on a bounded candidate set, not the entire follow graph:

1. Take the top N precomputed entries plus recent celebrity posts.
2. Score with features such as recency, affinity, engagement, and content type.
3. Filter blocked authors, deleted posts, and already-seen items.
4. Return a page and a cursor.

Precompute a base rank during fan-out and refresh it lazily. For a "For You" feed, use a separate candidate generator and ranking pipeline so the Following feed stays cheap and predictable.

## Architecture

```text
Post service -> posts store
     |
     +-> fan-out queue -> fan-out workers -> feed store (per user)
     |                         |
     |                         +-> ranking service
     |
     +-> counter pipeline -> counters cache/store

Feed service -> feed cache -> feed store
     |              |
     |              +-> celebrity recent-posts index
     +-> ranking + filtering -> response
```

- **Post service** writes the post, then publishes a fan-out event. The write succeeds even if fan-out is delayed.
- **Fan-out workers** read the follower list in pages and write feed entries in batches. They are idempotent so retries do not duplicate entries.
- **Feed service** reads a user's precomputed feed from cache/store, merges celebrity posts, ranks, filters, and paginates.
- **Counter pipeline** aggregates likes and comments asynchronously; the feed reads cached counts.
- **Social graph service** owns follows and blocks and exposes follower pages for fan-out.

## Scale

50 billion reads/day is roughly 580k QPS average, with peaks much higher. The design assumes most reads are served from cache and precomputed feeds.

- Shard feed entries by `user_id`; a user's feed lives on one shard.
- Cache the first few pages per active user; invalidate or append as new entries arrive.
- Fan-out writes are batched and rate-limited; 20M writes/day is manageable when celebrity accounts are excluded.
- Store only a bounded number of feed entries per user (for example, the most recent 1,000) and fall back to a timeline query for older pages.
- Keep media in object storage and serve it through a CDN.

## Trade-offs

- **Fan-out on write vs read:** write fan-out gives fast reads but amplifies writes and storage; read fan-out is cheaper for celebrities but slower and more complex at read time. The hybrid model is usually the right compromise.
- **Precomputed rank vs rank at read:** precomputed rank is cheap but stale; ranking at read is fresher but costs CPU per request. Precompute a coarse score and refine a bounded candidate set.
- **Strong vs eventual consistency:** a few seconds of delay for new posts and counts is acceptable. Deletes and blocks need faster propagation because they affect safety and trust.
- **Offset vs cursor pagination:** cursors are stable under inserts; offsets duplicate or skip items.
- **Storage amplification vs read latency:** keeping more precomputed entries costs storage but reduces fallback queries.

## Failure modes and monitoring

- **Fan-out backlog:** posts still exist in the author timeline. The feed service can merge recent author posts while the queue catches up. Alert on queue lag.
- **Celebrity post:** do not fan out; merge at read. Cache the recent celebrity index and protect it from stampedes.
- **Cache outage:** fall back to the feed store with a lower page size and load shedding. Never let a cache outage take down reads.
- **Stale feed:** show a "new posts" indicator and let the user refresh. Do not silently reorder pages.
- **Delete/block propagation:** remove entries from precomputed feeds asynchronously and filter at read time as a backstop.
- **Counter drift:** treat counts as approximate; reconcile periodically from the event log.
- **Ranking rollout:** version the model, shadow-test it, and keep a chronological fallback.
- **Monitoring:** track feed p99, cache hit rate, fan-out queue lag, fan-out error rate, ranking latency, counter lag, and the fraction of reads served from fallback paths.
