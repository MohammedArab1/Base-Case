# Reading Real-World Architectures

Architecture posts look different on the surface: one has a dozen boxes, another has a queue, another has three regions. Underneath, the same small set of patterns repeats. Learning to read those patterns is more useful than memorizing one company's diagram.

## How to read an architecture post

Read for the decisions, not the product names.

1. **What user action starts the story?** Pick one: open a feed, upload a file, send a message.
2. **What data is created or read?** Name the record and its size.
3. **Is the path read-heavy or write-heavy?** The ratio explains the caches and queues.
4. **Where does the request wait?** Network calls, locks, database queries, and queue delays are the real latency.
5. **What happens when a component fails?** Look for replication, retries, and degradation.
6. **What did the authors give up?** Consistency, simplicity, cost, or freshness.

Skip the brand names until you can explain the role each component plays. "We used a fast key-value store" is less useful than "we needed a low-latency lookup by session id and could tolerate losing a session on failure."

## The shared skeleton

Most large web systems are variations on one shape.

```text
client
  |
  v
DNS resolution  (a lookup, not a request hop)
  |
  v
CDN / edge cache
  |
  v
reverse proxy / load balancer
  |
  v
stateless application tier  <---->  cache
  |                    \
  v                     v
primary database      queue  ---->  workers  ---->  external services
  |
  v
read replicas
```

Not every system needs every box. The skeleton is a checklist of questions:

- Is the content cacheable at the edge?
- Is the application tier stateless?
- Which data set is the source of truth?
- What work can leave the request path?
- What is observed when something goes wrong?

## Patterns worth recognizing

### Fan-out on write and fan-out on read

When one event must reach many readers, there are two directions.

```text
fan-out on write:
  post -> write one feed entry per follower -> fast reads, expensive writes

fan-out on read:
  post -> store once -> merge at read time -> cheap writes, expensive reads
```

Most feeds use a hybrid: fan out for normal accounts and merge celebrity posts at read time, so one popular account does not create millions of writes.

### Consistent hashing

Consistent hashing maps keys onto a ring of nodes.

```text
            node A
          /        \
      key 7        key 1
        |            |
      node D      node B
          \        /
            node C
```

When a node is added or removed, only the keys near it move. Without consistent hashing, changing the number of nodes can remap almost every key and cause a cache miss storm.

It is a building block, not a complete storage design. Replication, rebalancing, and hot keys still need a plan.

### Scatter-gather

A scatter-gather request sends work to several shards or services in parallel, then combines the results.

```text
request
  |----> shard 1 ----|
  |----> shard 2 ----|--> merge -> response
  |----> shard 3 ----|
```

It reduces latency when the parts are independent. It also makes tail latency worse: the response waits for the slowest shard. Limit the fan-out, use deadlines, and decide whether a partial result is acceptable.

### MapReduce

MapReduce is a batch pattern for processing a large data set across many machines.

```text
split input
  |
  v
map:    turn each record into key/value pairs
  |
  v
shuffle: group values by key
  |
  v
reduce: combine each group into a result
```

A word count is the classic shape: map each word to `(word, 1)`, group by word, then sum. MapReduce is for large offline jobs, not for a user waiting on a page. Modern systems often use a similar split-map-shuffle-reduce model with different execution engines.

### Outbox and idempotent consumer

A service often needs to change its database and publish an event together.

```text
transaction:
  write order row
  write outbox row

publisher:
  read unsent outbox rows
  publish event
  mark sent
```

The consumer stores processed message ids and ignores duplicates. This turns "exactly once" into at-least-once delivery plus deduplication, which is achievable.

### Read models and CQRS

Command Query Responsibility Segregation (CQRS) separates the write model from one or more read models. Sometimes reads and writes want different shapes. A read model is a denormalized copy built for queries, updated from events or a change stream. The trade is the same as any denormalization: faster reads, more moving parts, and a lag to explain.

## Capstone: read a feed design

Use the seven dimensions from the design scenarios.

1. **Requirements**: users follow each other; opening the app shows recent posts; a post may contain text and an image; reads vastly outnumber writes.
2. **API**: `POST /posts`, `GET /feed?cursor=...`, `POST /follow`, `DELETE /follow`.
3. **Data model**: users, follows, posts, and per-user feed entries. The feed entry is denormalized so the read path does not join every follow.
4. **High-level design**: write the post, enqueue fan-out, let workers insert feed entries, serve the feed from a cache or feed store.
5. **Deep dives**: celebrity accounts, cursor pagination, media in object storage, and ranking.
6. **Trade-offs**: fan-out on write makes reads fast and writes expensive; eventual feed updates are acceptable; ranking adds complexity.
7. **Failure and monitoring**: queue lag, fan-out failures, cache misses, and a fallback that merges recent posts at read time.

The same method works for a file-sync design: metadata in a database, bytes in object storage, a change log for devices, conflict handling, and resumable uploads.

## Map interview themes to practice

Public interview lists reuse the same themes. The scenarios in Base Case are original, but they practice the same ideas.

| Theme                                 | Practice scenario   |
| ------------------------------------- | ------------------- |
| Create and redirect short links       | URL Shortener       |
| Timeline, feed, and ranking           | News Feed           |
| Crawl, index, and autocomplete        | Search Autocomplete |
| Personal finance ledger and transfers | Payment Ledger      |
| Social graph and relationships        | News Feed           |
| Key-value lookup and caching          | URL Shortener       |
| Chat, presence, and message delivery  | Chat System         |
| File sync, versioning, and conflicts  | File Sync           |
| Seat booking and inventory            | Seat Reservation    |
| API rate limiting                     | Rate Limiter        |

If a prompt is not on this list, reduce it to the same questions: what is read, what is written, what must be consistent, and what can be delayed.

## What is out of scope

Object-oriented design questions are a different interview format. Designing a parking lot, a call center, a deck of cards, a chat server's class model, or a circular array is about classes and responsibilities, not distributed systems.

Base Case does not claim object-oriented design coverage. The hash map and LRU cache appear here as data structures, which is the part that overlaps with coding interviews.

The System Design Primer also marks a few distributed topics as under development. MapReduce, consistent hashing, and scatter-gather are introduced above at a conceptual level. This library does not provide a distributed batch-processing implementation.

## A practice loop

1. Pick one scenario and set a 45-minute timer.
2. Spend 5-8 minutes on requirements and scale.
3. Sketch the API and data model.
4. Draw the smallest high-level design that covers the core flow.
5. Deep dive on the hardest part: fan-out, collisions, consistency, or failure.
6. Finish with trade-offs, monitoring, and what changes at 10x.
7. Compare with the reference design and note the gaps.

## What to say in an interview

> "I look for the user flow, the read/write ratio, the stateful components, and the failure boundary. Then I map each box to a pattern: cache, queue, replication, fan-out, or partition. For each choice I name the trade-off and the metric I would watch. At the end I can explain what would change at 10x."

That is the skill the architecture post is trying to teach.
