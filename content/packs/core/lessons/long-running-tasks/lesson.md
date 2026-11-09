# Managing Long-Running Tasks

Some work takes seconds or minutes: transcoding a video, building a report, indexing a large document, or calling a slow third party. A normal request is the wrong place for it.

_This lesson follows the Common Patterns part of a curriculum structured around the HelloInterview System Design in a Hurry outline. The explanations and examples are original._

## When a request is too slow

A request has a budget. Load balancers, gateways, and users all have timeouts. A task that regularly exceeds the budget should not run inside the request.

Signs that work belongs in the background:

- the duration is unpredictable;
- the work is CPU, GPU, or disk heavy;
- it depends on a slow external service;
- the user can continue without the result;
- a deploy or crash would lose the work.

Keep the request synchronous when the user needs the result to continue, the work is short and predictable, or the added queue would cost more than it saves. A 200 ms resize does not need a job system. A 20-minute transcode does.

## Accept, persist, return

The API should validate the request, create a durable job record, and return quickly.

```text
client -> API -> job store -> 202 Accepted + job_id
                   |
                   v
              worker pool -> result store
```

The job record contains the type, payload, owner, status, attempt count, timestamps, and idempotency key. Persist it before acknowledging. If the process crashes after the response, the job must still exist.

Use a broker for queued work, or a database table with a claim query. A broker is good at high throughput and delayed retries. A database is good when the job must be transactional with other rows and the volume is modest.

Workers pull jobs, take a lease, and heartbeat while they work. A lease lets another worker recover a job when a worker dies. The delivery contract is at-least-once, so the worker must be idempotent.

## The status API

The submit response should return `202 Accepted` and a location.

```text
POST /reports
202 Accepted
Location: /jobs/job_8f2a
```

Then:

```text
GET /jobs/job_8f2a
200 OK
{"status":"running","progress":42,"step":"rendering page 210 of 500"}
```

Common states are `queued`, `running`, `succeeded`, `failed`, and `cancelled`. On success, return a result URL or an inline result. On failure, return a stable error code and a human-readable message.

The submit endpoint needs an idempotency key. A client retry after a timeout should return the same job, not start a second transcode.

## Retries, backoff, and dead letters

Not every failure deserves a retry.

- **Transient**: timeout, rate limit, temporary network error. Retry.
- **Permanent**: invalid input, unsupported format, permission denied. Fail.
- **Unknown**: retry a bounded number of times, then fail.

Use exponential backoff with jitter.

```text
attempt 1 -> 2s
attempt 2 -> 4s
attempt 3 -> 8s
attempt 4 -> 16s
attempt 5 -> dead-letter queue
```

A dead-letter queue stores jobs that exhausted retries. It needs an owner, an alert, and a replay tool. A job that keeps failing is a signal, not a message to discard.

Idempotency makes retries safe. Use the job ID as the output key, or store a deduplication record. An upsert to the same output path is safer than appending a second result.

## Progress tracking

Progress is for the user, not for the scheduler. Update it at a bounded rate, such as every five seconds or every five percent, rather than after every item.

```text
job_8f2a  running  42%  rendering page 210 of 500
```

For multi-step work, report the step name and a coarse percentage. A heartbeat proves the worker is alive; progress proves it is moving. They are different signals.

The client can poll the status endpoint, or subscribe through SSE or a WebSocket. Polling every second is fine for a report that takes minutes. Do not build a live connection only for a progress bar.

## Cancellation

Cancellation should be cooperative. Mark the job as `cancelling`, and let the worker check the flag between chunks.

```text
worker loop:
  if job.cancelled: stop, clean up, mark cancelled
  process next chunk
```

Some work cannot be interrupted: a single long database query, a third-party call, or a GPU kernel. Set timeouts and clean up partial output after the step returns. Cancellation is not deletion; decide whether the partial result should remain, be removed, or be marked incomplete.

## Worker autoscaling and backpressure

Scale workers on queue depth and the age of the oldest job, not CPU alone. A CPU-idle worker may be waiting on a network call.

```text
queue depth 10,000, oldest job 30 min -> scale out
queue empty for 20 min              -> scale in slowly
```

Autoscaling has limits. Workers take time to start, GPU capacity may be scarce, and the downstream database may not tolerate a sudden burst. Set a maximum and protect the dependency.

Bound the queue. When it is full, reject new jobs with `429` or `503` instead of accepting work that will wait for hours. Priority queues let interactive jobs overtake batch jobs. Per-tenant quotas prevent one customer from filling the system.

## At-least-once, not exactly-once

A worker can finish the work and crash before acknowledging. The job runs again. Exactly-once processing is at-least-once delivery plus idempotency.

```text
job_8f2a -> output key "renditions/job_8f2a"
retry     -> same key, overwrite or skip
```

For side effects outside the worker, use the provider's idempotency key. For a payment, the key belongs on the charge request. For an email, a sent-log table can prevent a duplicate send, though a crash between send and record can still produce one. Say which guarantee the product actually needs.

## Worked example: video transcode

```text
upload -> object storage
       -> create job (video_id, source, renditions)
       -> 202 + job_id
worker -> download source
       -> transcode 360p, 720p, 1080p
       -> upload renditions
       -> update progress and status
```

The upload completes before the job is created, so the worker never reads a half-written file. Each rendition is keyed by job and resolution, so a retry overwrites instead of duplicating. A corrupt source fails permanently and goes to the dead-letter queue with a clear error. A transient encoder crash retries with backoff. Cancellation stops between renditions and removes partial outputs.

GPU workers scale on queue depth, with a cap based on cost and encoder capacity. The status API reports the current rendition and percentage. When the job succeeds, the API returns playback URLs and publishes an event so the UI can refresh.

## When synchronous processing is better

A queue adds moving parts: a broker, workers, retries, status storage, and monitoring. For a short task, that is a poor trade. Keep it in the request when:

- the task finishes within the request budget;
- the user needs the result immediately;
- failures are easy to return as a normal error;
- volume is low enough that a worker pool is wasted capacity.

Measure before splitting the system. A background job is a tool for slow or unreliable work, not a default architecture.

## What to say in an interview

> "The upload API stores the source, creates a job row with an idempotency key, and returns 202 with a job ID. Workers claim jobs with a lease, heartbeat, and retry transient failures with jitter. Progress and status are exposed through a status endpoint. After the last retry, the job goes to a dead-letter queue with an alert. Outputs are keyed by job ID, so at-least-once delivery does not create duplicates."

That covers acceptance, processing, failure, observability, and the delivery guarantee.
