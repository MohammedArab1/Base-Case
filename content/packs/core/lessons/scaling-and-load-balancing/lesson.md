# Scaling and Load Balancing

A single server can handle a surprising amount of traffic. Eventually it cannot. Scaling is the plan for what happens next.

## Two directions

**Vertical scaling** means a bigger machine: more CPU, more memory, faster disk.

```text
4 cores -> 16 cores
16 GB    -> 128 GB
```

It is simple but has a ceiling and often a large price jump. A single machine is also a single failure point.

**Horizontal scaling** means more machines.

```text
1 server -> 10 servers behind a load balancer
```

It can grow much further and survive individual failures, but it introduces coordination problems.

## Make the service stateless

The easiest service to scale keeps no user-specific state between requests.

```text
bad:  session data in server memory
      the next request may hit a different server

good: session data in a shared store or signed token
      any server can handle the next request
```

Stateful pieces still exist: databases, caches, queues. The goal is to concentrate state in systems designed for it, not to eliminate it.

## Load balancers

A load balancer sits in front of the servers and chooses one for each request.

```text
clients
   |
   v
load balancer
   |     |     |
   v     v     v
 API   API   API
```

Common strategies:

- **Round robin**: take turns. Simple, works when requests cost about the same.
- **Least connections**: send to the backend with the fewest active requests. Better for uneven durations.
- **Consistent hashing**: map a key to a backend. Useful for caches, because the same key tends to hit the same cache.
- **Random**: simple and surprisingly effective at large scale.

Health checks tell the balancer which backends are alive. A shallow check might only verify that the process responds. A deeper check verifies a critical dependency. Too deep a check can cause cascading removals when a shared dependency wobbles; choose the check deliberately.

## Sticky sessions

If the service does keep per-user state, the balancer can route the same user to the same backend. That is a **sticky session**.

It works, but it makes scaling and failure recovery harder. When a backend dies, its users lose their sessions. Prefer shared state or signed tokens when possible.

## Autoscaling

Autoscaling adds or removes instances based on a signal such as CPU, request rate, or queue depth.

```text
scale out when average CPU > 70% for 2 minutes
scale in when average CPU < 30% for 10 minutes
```

Scaling in should be slower than scaling out. A rapid scale-in can remove capacity just before the next burst.

## The real bottleneck

Adding web servers does not help if every request waits on one database.

```text
10 API servers -> 1 database
```

The database is the shared bottleneck. The next steps are caching, read replicas, query optimization, and eventually partitioning.

## Hot keys and hotspots

Balanced traffic is an average. A single celebrity post, popular product, or chat room can concentrate load.

Mitigations:

- cache the hot value close to the consumer;
- coalesce many identical requests into one backend fetch;
- split the hot key into shards and combine the results;
- give the hot object its own dedicated capacity.

## The sentence to say

> "The API tier is stateless and scales horizontally behind a least-connections load balancer. The database is the shared bottleneck, so reads go through a cache and replicas, and writes are partitioned by user ID."

That tells the interviewer what scales, what does not, and why.
