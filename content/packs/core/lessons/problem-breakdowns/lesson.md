# Working Through a Problem Breakdown

A design prompt is vague on purpose. The interviewer wants to see how you turn an open question into a small set of decisions you can defend. This lesson gives one route from the prompt to the closing summary. Use the same route in practice until it feels routine.

The sequence follows the public HelloInterview System Design in a Hurry outline as a structural guide. The explanations, examples, and table here are original to Base Case.

## Read the prompt and choose three features

Read the prompt twice. The first pass is for the product. The second pass is for constraints, scale, and anything that sounds like a hard requirement.

Then choose no more than three features:

1. The core flow that makes the product useful.
2. The feature that changes the architecture.
3. The constraint that could break the design.

For "design a service where people post short updates and followers read a feed," the three could be:

- publish a post;
- follow an account and read a feed;
- keep the feed fast when an account has millions of followers.

State what you are leaving out: ads, moderation, direct messages. A narrow design finished well is stronger than a broad sketch with no depth.

## Turn requirements into constraints

Separate functional requirements from non-functional requirements.

Functional requirements are user actions. Non-functional requirements are the promises around them: latency, availability, consistency, durability, privacy, cost, and retention.

Write numbers next to the promises. Use daily actions to estimate reads and writes.

```text
50,000,000 daily users
x 10 feed reads per day
= 500,000,000 reads per day

500,000,000 / 86,400 ~ 5,800 reads/s average
x 3 peak factor    ~ 17,000 reads/s at peak
```

The estimate does not need to be exact. It needs to be good enough to rule out one design and point toward another. A feed at 17,000 reads/s needs a cache and a precomputed feed. A feed at 50 reads/s does not.

If a number is unknown, give a range and name the point you will design for. Write the assumption down so you can return to it later.

## Name the core entities

The nouns in the prompt usually become records. For each entity, write down:

- its identity;
- the fields that matter;
- who owns it;
- its approximate size;
- how it is read and written;
- how long it lives.

For the feed example: user, follow, post, and feed entry. The feed entry is derived data. The post is the source of truth. Saying that out loud prevents a later argument about which copy wins.

## Write a small API

The verbs in the prompt become endpoints. Keep the list short. Include pagination, idempotency, and the error cases that matter.

```text
POST   /posts              create a post
GET    /feed?cursor=...    read the feed
POST   /follows/{userId}   follow an account
DELETE /follows/{userId}   unfollow an account
GET    /posts/{postId}     read one post
```

A cursor is better than an offset for a feed. A create endpoint should accept an idempotency key if retries can create duplicates. Say these choices out loud; they are part of the design.

## Draw the smallest high-level design

Start with one end-to-end path. Add a component only when a requirement forces it.

```text
client
  |
  v
API tier  --->  post database
  |                  |
  |                  v
  |            fan-out queue
  |                  |
  |                  v
  |            fan-out worker
  |                  |
  |                  v
  +---------->  feed store  --->  feed cache
```

Then trace two paths:

- Write: the API commits the post, then enqueues a fan-out job. The user does not wait for the fan-out.
- Read: the API checks the feed cache, then the feed store, and returns a page.

Every box should have a role and a data set. "Kafka" is not a role. "Queue that absorbs fan-out bursts" is.

## Choose deep dives from the hard part

Pick two or three places where the design could fail or become expensive. The prompt usually hints at them.

For the feed, good deep dives are:

- celebrity accounts, where fan-out on write creates millions of rows;
- feed freshness, where queue lag decides how long a post takes to appear;
- pagination, where a busy feed shifts under the reader.

A deep dive needs a mechanism and a trade-off. For celebrities, fan out for normal accounts, store celebrity posts once, and merge them at read time. Reads become slightly more expensive for followers of celebrities, and writes stop exploding.

## Recognize the pattern

Most prompts reduce to a small set of shapes:

- exact lookup by key;
- read-heavy content;
- write-heavy events;
- many-to-many fan-out;
- real-time delivery;
- conflicting concurrent writes;
- multi-step correctness;
- ranking and search;
- large binary objects;
- batch processing.

Once you name the shape, the patterns follow: cache, replica, partition, queue, fan-out, lock, idempotency key, outbox, index, or snapshot.

| Base Case design    | Common prompt shape                         | Patterns to reach for                                       |
| ------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| URL Shortener       | Short links, redirects, click counts        | Key generation, key-value lookup, cache, async analytics    |
| Rate Limiter        | Protect an API from too much traffic        | Token bucket, sliding window, shared counters, local limits |
| Chat System         | One-to-one and group messaging              | WebSocket, presence, per-conversation order, offline queue  |
| News Feed           | Timeline from followed accounts             | Fan-out hybrid, ranking, cache, cursor pagination           |
| Seat Reservation    | Book a specific seat without double booking | Hold, unique constraint, expiry, idempotent confirmation    |
| Search Autocomplete | Ranked suggestions for a typed prefix       | Prefix index, top-k, aggregation, cache, prefix sharding    |
| File Sync           | Keep files consistent across devices        | Chunking, content hash, change log, conflict copy           |
| Payment Ledger      | Move money once, with an audit trail        | Double-entry, transaction, idempotency, outbox, reconcile   |

## Practice in a deliberate order

Start with designs where the data model and API carry most of the answer. Then add fan-out, real time, concurrency, and multi-step correctness.

1. URL Shortener: exact lookup, key generation, cache, analytics.
2. Rate Limiter: counters, windows, distributed state, failure policy.
3. Search Autocomplete: prefix index, ranking, aggregation, hot keys.
4. News Feed: fan-out, denormalization, pagination, celebrity edge case.
5. Chat System: long-lived connections, ordering, delivery, presence.
6. Seat Reservation: concurrent writes, holds, expiry, idempotency.
7. Payment Ledger: transactions, audit, reconciliation, idempotent posting.
8. File Sync: chunking, metadata, conflict resolution, resumable transfer.

The order is a suggestion, not a rule. If a prompt exposes a weakness, repeat that scenario before moving on.

## Review with a rubric

Score each row from 0 to 2 after a practice run.

| Row                    | 0                                     | 2                                                  |
| ---------------------- | ------------------------------------- | -------------------------------------------------- |
| Scope                  | No clear features or out-of-scope     | Three features and explicit exclusions             |
| Numbers                | No estimate or wrong units            | Assumptions, peak factor, and a component decision |
| API and data model     | Missing entities or endpoints         | Entities, ownership, and a small API               |
| End-to-end flow        | Boxes with no traced request          | One write and one read traced through every hop    |
| Deep dive              | Repeats the overview                  | Mechanism, number, and trade-off                   |
| Failure and monitoring | No failure path                       | Lag, retries, fallback, and an alert               |
| Delivery               | Runs out of time or hides uncertainty | States assumptions and finishes with a summary     |

A score below 10 means the next practice run should focus on the weak rows, not on adding more components.

## Common ways the breakdown fails

- Spending twenty minutes on requirements and never drawing the system.
- Choosing a database before naming the access pattern.
- Listing technologies without saying what each one does.
- Treating the prompt's hard constraint as a footnote.
- Skipping the deep dive because the overview looks complete.
- Adding a queue, cache, and second database with no requirement for them.

## What to say in an interview

> "I would narrow this to three features: publish, follow and read, and fast reads for popular accounts. The read path is about 17,000 requests per second at peak, so the feed is precomputed and cached. The write commits the post, then a queue drives fan-out. The hard part is celebrity fan-out, so I would use a hybrid and merge those posts at read time. I would watch queue lag, cache hit rate, and feed p99, and I would rebuild the feed store if fan-out falls behind."

That is the whole route: scope, numbers, entities, API, one flow, one hard part, and a closing check.
