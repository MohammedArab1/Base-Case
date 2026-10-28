# Message Queues and Observability

A queue lets one part of the system hand work to another part without waiting. That is useful for slow, bursty, or unreliable work.

```text
producer -> [ queue ] -> consumer
```

## What to put on a queue

Good candidates:

- sending email or push notifications;
- generating a thumbnail or export;
- fanning a post out to followers;
- indexing a document for search;
- retrying a third-party call.

Bad candidates:

- the response the user is waiting for;
- an operation whose result must be known before the next step;
- work that must be strongly ordered with a synchronous read.

## Delivery guarantees

- **At-most-once**: send and forget. A crash can lose the message.
- **At-least-once**: acknowledge after processing. A crash can duplicate the message.
- **Exactly-once**: in practice, at-least-once delivery plus deduplication.

Assume duplicates happen. Make consumers idempotent by storing a message ID or using a natural idempotency key.

```text
consumer receives message 7
  if 7 already processed: acknowledge and skip
  else: process, record 7, acknowledge
```

## Retries and dead letters

A retry without a limit and a delay becomes a load amplifier.

```text
attempt 1 -> wait 1s
attempt 2 -> wait 2s
attempt 3 -> wait 4s
attempt 4 -> wait 8s
attempt 5 -> dead-letter queue
```

Add jitter so many consumers do not retry at the same instant. Move messages that keep failing to a **dead-letter queue** for inspection. A dead-letter queue is not a trash can; it is a work queue with a person attached.

## Backpressure

If producers outpace consumers, the queue grows. Eventually it fills the disk or adds minutes of latency.

Options:

- scale out consumers;
- add a maximum queue length and reject new work with a clear error;
- batch work to increase throughput;
- drop or coalesce low-value work;
- slow the producer with a rate limit.

Choosing to drop work is a product decision. Say it explicitly rather than letting the queue grow until it fails.

## Fan-out

A news feed often needs to notify many followers about one post.

```text
post created
  |
  v
fan-out worker -> per-user feed entries -> followers
```

This is **fan-out on write**. It makes reads fast and writes expensive. The alternative is **fan-out on read**: gather posts at read time. It makes writes cheap and reads expensive.

A hybrid is common: fan out for normal users, and merge celebrity posts at read time to avoid millions of writes for one account.

## Observability

Three signals, tied together:

- **Metrics**: aggregated numbers such as requests per second, error rate, p95 latency, queue depth, and cache hit ratio.
- **Logs**: structured events with a request ID, user or tenant (never secrets), and a result.
- **Traces**: one request followed across services, with a span per hop.

```text
trace 8f2a
  API           12 ms
  auth           8 ms
  feed cache     2 ms
  database      61 ms
  render         5 ms
```

The trace shows where the time went. The metric shows whether it is happening to everyone. The log explains the specific failure.

## SLOs and alerts

An SLO is an internal target such as "99.9% of redirects succeed under 200 ms." An alert should fire on a symptom users feel, not on every CPU spike.

Useful alerts:

- error rate above a threshold for a sustained window;
- p95 latency above the SLO;
- queue depth growing for several minutes;
- replication lag beyond a safe bound;
- dead-letter queue receiving messages.

Each alert needs an owner and a runbook. Otherwise it becomes noise.

## The design sentence

> "Publishing a post writes the post synchronously, then enqueues a fan-out job. The consumer is idempotent, retries with jitter, and sends poison messages to a dead-letter queue. We track fan-out lag, queue depth, error rate, and p95 read latency, with alerts on sustained lag."

That covers the async boundary, the failure path, and the visibility.
