# How a System Design Interview Works

A system design prompt is deliberately vague: "Design a URL shortener." "Design a news feed." The interviewer wants to see how you turn ambiguity into a coherent design.

It is a conversation, not a memorized architecture.

## A structure that works

```text
1. Clarify
2. Estimate
3. Define the API and data
4. Sketch the high-level flow
5. Deep dive
6. Handle failure
7. Trade-offs and next steps
```

You do not have to follow the order rigidly, but every part should appear.

## 1. Clarify

Ask about users, core flows, and scope.

- Who uses it?
- What are the three most important actions?
- What is explicitly out of scope?
- Is it read-heavy or write-heavy?
- What consistency does the user notice?

Write the answers down. A short list of assumptions is more useful than a long list of features.

## 2. Estimate

Round numbers are enough. You are checking orders of magnitude, not doing accounting.

```text
10 million daily users
each user makes 5 reads and 1 write per day

reads/day  = 50 million
writes/day = 10 million

average QPS = 50,000,000 / 86,400 ≈ 580 reads/s
peak QPS    ≈ 3x average ≈ 1,700 reads/s
```

Then estimate storage:

```text
10 million writes/day
500 bytes per record
= 5 GB/day
= about 1.8 TB/year before replication and indexes
```

If the numbers feel wrong, say so and revise. The point is to justify the components.

## 3. Define the API and data

A small API makes the design concrete.

```text
POST /links
GET  /:code
GET  /links/:code/stats
```

Then the main records:

```text
Link
  code        string, unique
  targetUrl   string
  ownerId     string
  createdAt   timestamp
  expiresAt   timestamp?
```

The data model exposes the access patterns. "Look up by code" suggests an index; "list by owner" suggests another.

## 4. Sketch the high-level flow

Start with the smallest diagram that covers the core path.

```text
client
  |
  v
load balancer
  |
  v
stateless API  --->  cache
  |                    |
  v                    v
primary database   read replicas
```

Label each arrow with what it carries. A box without a purpose is decoration.

## 5. Deep dive

Pick the one or two areas where the design is hardest.

- How is the short code generated without collisions?
- How does the feed fan out to millions of followers?
- How does a payment stay idempotent across retries?
- What happens when the cache is cold?
- How is the hot key handled?

The interviewer usually has a follow-up ready. Follow the interesting constraint.

## 6. Failure handling

Ask "what breaks?" out loud.

- The cache is unavailable: does traffic fall through to the database, and can the database survive it?
- A replica lags: will the user read stale data?
- A queue consumer crashes: is the message retried, duplicated, or lost?
- A region is unavailable: what is the recovery path?
- A retry storm starts: is there backoff and a deadline?

Failure handling is where a diagram becomes an engineering design.

## 7. Trade-offs and next steps

Finish with a summary:

> "This design favors low-latency reads with a cache and read replicas. The cost is possible staleness and more moving parts. At 10x traffic I would shard the link table, add a dedicated code-generation service, and revisit the cache eviction policy."

That sentence shows you know what you chose and what you gave up.

## A seven-part checklist

The app's design rubrics cover these seven areas, although they group them slightly differently:

1. Requirements and estimation
2. API and data model
3. High-level architecture
4. Deep dives or scale and performance
5. Trade-offs
6. Failure modes and monitoring
7. Communication

Use this as a checklist when you practice, then follow the per-design rubric for its exact dimensions and weighting. A design that covers all seven is usually a complete conversation.
