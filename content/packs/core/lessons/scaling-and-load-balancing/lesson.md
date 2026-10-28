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

### Active-passive and active-active

The load balancer itself must not be a single point of failure. Two common arrangements:

```text
active-passive:
  [ balancer A ]  <-- heartbeats -->  [ balancer B ]
       active                           standby

active-active:
  [ balancer A ]  <-- traffic -->  [ balancer B ]
       active                         active
```

Active-passive is simpler because only one balancer takes traffic. Failover takes time and the standby must be ready. Active-active uses both, but clients need a way to reach either address, and both must agree on backend health and routing.

At the backend tier, the same words describe the servers. Active-passive backend pairs have one serving and one waiting; active-active pairs both serve. Active-active is easier for reads than for writes.

### Layer 4 and layer 7

A load balancer can make decisions at different levels.

```text
layer 4:  source IP, destination IP, port
layer 7:  HTTP method, path, host, header, cookie
```

**Layer 4** forwards connections quickly and does not inspect application content. **Layer 7** reads the request, can route by path or header, and can terminate TLS. Layer 7 is more flexible and uses more CPU. Choose layer 4 for simple high-throughput forwarding and layer 7 when routing depends on the request content.

### TLS termination

TLS termination decrypts the client connection at the balancer or reverse proxy. Backends receive plain HTTP inside the private network.

```text
client --TLS--> [ load balancer ] --HTTP--> [ app ]
```

This centralizes certificates, simplifies backend configuration, and lets the balancer inspect the request for layer 7 routing. It also means traffic after the balancer is unencrypted unless you re-encrypt it. For sensitive data, terminate at the edge and re-encrypt to the backend, or pass the connection through and terminate at the backend.

## Sticky sessions

If the service does keep per-user state, the balancer can route the same user to the same backend. That is **sticky session**, or **session persistence**.

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

> "The API tier is stateless and scales horizontally behind an active-active pair of layer 7 load balancers. TLS terminates at the edge and is re-encrypted to the app for sensitive routes. The database is the shared bottleneck, so reads go through a cache and replicas, and writes are partitioned by user ID."

That tells the interviewer what scales, what does not, and why.
