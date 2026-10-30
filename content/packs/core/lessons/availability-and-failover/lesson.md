# Availability, Failover, and Replication

A service is available when it answers useful requests. A process can be running and still be unavailable: if it returns errors, times out, or cannot reach its database, users experience an outage. Availability is a property of the whole path, not of one green status light.

## Measuring availability

Availability is the fraction of time the service serves requests successfully.

```text
availability = successful time / total time
```

Teams often describe it in nines. The exact downtime depends on the period, so state the period when you use a number.

```text
99%      3.65 days/year    7.2 hours/month     14.4 minutes/day
99.9%    8.76 hours/year   43.8 minutes/month  86 seconds/day
99.99%   52.6 minutes/year 4.4 minutes/month   8.6 seconds/day
99.999%  5.3 minutes/year  26 seconds/month    0.9 seconds/day
```

Each added nine is expensive. It needs redundancy, automation, careful deploys, and a team that can respond quickly. Ask whether the product needs five nines, or whether four nines with a clear status page is the better trade.

Availability is not the same as durability. Durability means data survives; availability means requests are served. A system can lose data and stay available, or keep every byte and refuse writes during an outage.

## Sequence and parallel

Components are either in sequence or in parallel. The math is different.

```text
sequence: request must pass through A and B

client -> [ A ] -> [ B ] -> response

parallel: request can use A or B

        +--> [ A ] --+
client -|            |-> response
        +--> [ B ] --+
```

For components in sequence, multiply their availability:

```text
0.999 × 0.999 = 0.998001
```

Two 99.9% services in sequence produce about 99.8% availability. More hops make the path less reliable.

For independent components in parallel, the system fails only when all of them fail:

```text
1 - (1 - 0.999) × (1 - 0.999)
= 1 - 0.001 × 0.001
= 0.999999
```

That is about 99.9999%. The word **independent** matters. Two app servers behind the same database are not independent for database failures. Redundancy only helps where the failure is actually duplicated.

## Failover

Failover moves traffic from a failed component to a standby.

```text
active   [ primary ]  <-- heartbeats -->  [ standby ]  passive
             |
          traffic

primary stops answering
             |
             v
active   [ failed  ]                      [ standby ]  now active
```

A health check or heartbeat detects the failure. A controller promotes the standby, moves the address or updates routing, and tells the system that a new leader exists.

Failover time is not the same as detection time. The system must detect, decide, promote, and redirect. Each step adds seconds or minutes.

### Active-passive

One node serves traffic. The other waits.

- **Hot standby** is running and ready. Failover is faster and costs more.
- **Warm standby** is running but may need configuration or cache warm-up.
- **Cold standby** must be started. Failover is slow and cheap.

Active-passive is simpler to reason about because only one node writes. The risk is a gap between the last replicated write and the failure. The size of that gap is the data-loss exposure measured against the **recovery point objective (RPO)**.

### Active-active

Both nodes serve traffic.

Reads are easy to spread. Writes need a plan: partition users by region, use a single writer per shard, or accept conflict resolution. Active-active improves capacity and failure tolerance, but conflicts and routing become part of the design.

### Split brain

A failed node may still be alive from its own point of view. If both nodes believe they are primary, they can accept conflicting writes.

Guard against this with a quorum, a lease with an expiry, or a fencing token that storage checks before accepting a write. "The other node is probably dead" is not a safety mechanism.

## Replication

Replication keeps copies of the same data.

```text
          writes
            |
            v
        [ primary ]
          |     |
          v     v
      [ copy ] [ copy ]
```

- **Synchronous replication** waits for a copy before acknowledging. Less data loss, more write latency.
- **Asynchronous replication** acknowledges before every copy catches up. Faster writes, a possible loss window.

Replication is not only for backup. It provides read capacity, a failover target, and geographic locality. It also adds lag, operational work, and storage.

## RPO and RTO

Two numbers make a recovery plan concrete:

- **RPO (recovery point objective)**: how much recent data you can afford to lose, expressed as time. "Five minutes of writes" is an RPO.
- **RTO (recovery time objective)**: how long recovery may take. "Two minutes of downtime" is an RTO.

```text
backup every 24 hours, restore takes 3 hours
RPO ≈ 24 hours
RTO ≈ 3 hours
```

An asynchronous cross-region replica might give a five-minute RPO and a two-minute RTO. A nightly backup does not. State both numbers rather than saying "we have backups."

## Failure modes to name

- **Correlated failure**: replicas in the same rack, the same deployment, or behind the same config service fail together.
- **Retry storm**: clients retry at once and turn a small outage into a large one. Use backoff, jitter, and a retry budget.
- **Cascading failure**: one slow dependency fills every thread or connection, so healthy paths also stop.
- **Metastable failure**: the system stays degraded after the trigger is gone because queues, caches, or retries keep it overloaded.
- **Blast radius**: the share of the system affected by one failure. Bulkheads and separate pools reduce it.

## Graceful degradation

A good design decides in advance what to turn off.

- Serve cached or slightly stale reads when the primary is unavailable.
- Allow browsing but disable posting.
- Drop low-priority analytics before blocking a payment.
- Return a clear `503` with a retry hint instead of hanging.

Degradation is a product decision. Write it down before the incident.

## SLOs and error budgets

An **SLI** is a measured signal, such as the fraction of requests under 300 ms. An **SLO** is the target for that signal, such as 99.9% over 30 days.

The error budget is the allowed failure:

```text
99.9% over 30 days
allowed failure = 0.1% × 30 days
                ≈ 43 minutes
```

If the budget is nearly spent, slow down risky releases and fix reliability. The budget turns availability from a slogan into a decision rule.

## What to say in an interview

> "Reads are active-active across two zones behind latency-aware routing. Writes go to one primary per shard, with synchronous replication inside the region and asynchronous replication to the second region. Failover promotes a replica after three missed heartbeats, with a lease to prevent split brain. The cross-region RPO is five minutes and the RTO is two minutes. During a dependency outage we serve cached reads and disable posting rather than failing the whole page."

That names the topology, the failure detector, the data-loss boundary, and the degradation plan.
