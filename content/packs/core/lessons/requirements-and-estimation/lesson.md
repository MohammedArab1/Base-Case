# Requirements and Back-of-Envelope Estimation

Before you choose a database, decide what the system must do and how much of it.

## Functional requirements

These are the actions the system supports.

```text
URL shortener:
- create a short link from a long URL
- redirect a short code to the target
- show basic click counts
- let a link expire
```

Keep the list short. Three to five core flows are enough for an interview. Say what is out of scope: user accounts, billing, advanced analytics.

## Non-functional requirements

These are the qualities the system must have.

- **Latency**: redirects under 100 ms at p95 (95% of requests finish below that value).
- **Availability**: 99.9% for reads.
- **Durability**: a created link is not lost after a crash.
- **Consistency**: a new link is readable immediately by its creator.
- **Scalability**: handle 10x growth without a redesign.
- **Cost**: stay within a stated budget.
- **Security**: do not expose private links.

A requirement without a number is hard to design against. "Fast" is not a requirement; "p95 under 100 ms" is.

## The estimation formula

Start with users and actions.

```text
daily active users = 10,000,000
actions per user per day:
  reads  = 20
  writes = 2
```

Daily totals:

```text
reads  = 200,000,000
writes = 20,000,000
```

Convert to QPS:

```text
reads/s  = 200,000,000 / 86,400 ≈ 2,300
writes/s = 20,000,000 / 86,400 ≈ 230
```

Peak is often a multiple of average:

```text
peak reads ≈ 3 * 2,300 ≈ 7,000/s
```

Now storage:

```text
record size = 500 bytes
daily writes = 20,000,000
daily raw storage = 10 GB
yearly raw storage = 3.65 TB
with 3x replication and roughly 20% for indexes ≈ 13 TB
```

Bandwidth:

```text
7,000 reads/s * 2 KB per response ≈ 14 MB/s ≈ 112 Mbps
```

These numbers are rough. That is the point. They tell you whether one database is plausible or whether you need partitioning.

## Read-heavy versus write-heavy

The ratio changes the design.

- Read-heavy: cache, read replicas, denormalized views.
- Write-heavy: append-only logs, batching, partitioning by write key.
- Mixed: separate the paths and measure both.

Ask the interviewer if the ratio is known. If not, state an assumption and continue.

## Latency budgets

A user-facing request may pass through several services. Give each step a budget.

```text
total budget: 200 ms

load balancer     5 ms
auth service     20 ms
cache lookup      5 ms
database (miss)  80 ms
serialization    10 ms
network slack    80 ms
```

If one step regularly exceeds its budget, the design needs a change. A timeout without a budget is just a guess.

## Availability math

```text
99%      ≈ 7.2 hours/month
99.9%    ≈ 43 minutes/month
99.99%   ≈ 4.3 minutes/month
99.999%  ≈ 26 seconds/month
```

Each nine requires more redundancy, more automation, and more cost. Ask whether the product actually needs it.

## What to do with the estimate

Use it to make decisions:

- If reads are much higher than writes, add a cache and replicas.
- If storage grows into terabytes per year, plan retention and partitioning.
- If peak traffic is far above average, plan for burst capacity.
- If the latency budget is tight, reduce network hops before optimizing code.

Then say which numbers are assumptions. A design built on a stated assumption is much easier to defend than one built on a hidden guess.
