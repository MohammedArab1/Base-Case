# Performance, Scalability, and Latency

Two systems can look identical in a demo and behave very differently on launch day. One is slow for everybody. The other is fast until a crowd arrives. The words we use for those problems point to different fixes.

## Two different problems

- A **performance** problem means the system is slow for a single user.
- A **scalability** problem means the system is fast for a single user but slow under heavy load.

A useful picture is a shop with one checkout lane.

```text
performance problem:
  one cashier is slow
  -> make that cashier faster

scalability problem:
  the cashier is fast, but the line reaches the door
  -> open more lanes, or reduce the work per customer
```

The two fixes are not interchangeable. Adding servers to a system with a slow query may only add more callers to the same slow query. Making one query faster does not help if every request still waits for one saturated database.

## Latency and throughput

**Latency** is the time one action takes. **Throughput** is how many actions finish per unit of time.

```text
latency    = seconds per request
throughput = requests per second
```

Think about delivery. A motorcycle can cross town quickly. Its latency is low. A fleet of trucks can move many parcels per hour, so its throughput is high even if each truck is slower.

The two are related but not the same:

- Batching increases throughput and usually increases latency, because each item waits for the batch.
- Caching lowers latency and often raises throughput, because each request uses less work.
- A system can have low latency for one request and terrible throughput once requests queue.

Aim for the throughput you need at a latency your users accept. "Fastest possible" is not a requirement.

## The capacity equation

Concurrency, throughput, and latency are tied together by a small equation often called Little's Law:

```text
concurrency ≈ throughput × latency
```

Keep the units consistent: requests per second times seconds gives requests in flight.

```text
20 requests/s × 0.2 s = 4 requests in flight

1,000 requests/s × 0.2 s = 200 requests in flight
```

Use it to size connection pools, worker counts, and thread pools. If a service handles 200 requests per second and each request takes 50 ms, about 10 requests are in flight on average. A pool of 2 will queue. A pool of 10,000 will overwhelm the database.

The average is a starting point, not a guarantee. Bursts and slow requests change the peak.

## Averages hide the slow users

Latency is a distribution. A single average number hides the tail.

```text
100 requests:
  99 take  10 ms
   1 takes  10 s

average ≈ 110 ms
```

The average looks acceptable while one user waited ten seconds.

Percentiles describe the distribution:

- **p50** is the median: half of requests are faster, half are slower.
- **p95** means 95% of requests are faster than this value.
- **p99** means 99% are faster; the slowest 1% are above it.

Track p50, p95, and p99. The p99 is often what users remember, and it matters most when a page waits on several services at once.

```text
page calls 10 services in parallel
each service has a 1% chance of a slow response
the page waits for the slowest call
```

Even a small tail on each dependency can become a large tail for the page. This is sometimes called tail amplification.

Percentiles also need enough samples. A p99 from 20 requests is not meaningful. Use a window with enough traffic, and read it alongside the average and the maximum.

## Scale up or scale out

There are two directions to add capacity.

**Scale up** means a bigger machine.

```text
4 cores  -> 16 cores
16 GB    -> 128 GB
```

It is simple while it fits. Then the price jumps, the ceiling arrives, and the bigger machine is still one failure domain.

**Scale out** means more machines.

```text
1 server -> 10 servers behind a load balancer
```

It can grow further and survive individual failures, but it needs stateless services, routing, and operational discipline.

Start with the simplest thing that meets the requirement. Measure the bottleneck. Then scale the part that is actually saturated. Often that is the database, not the web tier.

## A worked sizing

Suppose peak traffic is 1,000 requests per second and each request takes 100 ms on one worker.

```text
requests in flight = 1,000 × 0.1 = 100
```

If one worker can handle 10 in flight, you need at least 10 workers. Add headroom for bursts and failures:

```text
10 workers × 1.5 headroom ≈ 15 workers
```

Then check the assumptions. Is the workload CPU-bound, waiting on the database, or waiting on a downstream API? The answer decides whether 15 workers is capacity or just 15 callers queueing at the same locked row.

## What it costs

- Benchmarks with tiny inputs miss the database and network costs that dominate production.
- Optimizing the application while the queue is in the database moves no real work.
- A connection pool that is too small creates avoidable queueing; one that is too large can take down the database.
- More instances increase downstream connections, log volume, and deployment surface.
- A latency target without a percentile is easy to pass on average and easy to miss for real users.

## What to say in an interview

> "This is a scalability problem, not just a performance problem: one request is fast, but p99 rises with concurrency. At 1,000 requests per second and 100 ms per request, about 100 requests are in flight. I would load test each tier, keep p99 under 300 ms, scale the stateless API tier, and protect the database with caching and read replicas before adding more app servers."

That names the symptom, the math, the target, and the next bottleneck.
