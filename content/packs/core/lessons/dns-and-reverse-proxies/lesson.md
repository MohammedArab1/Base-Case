# DNS and Reverse Proxies

Before a request reaches your application, two things happen. A name is turned into an address, and a front door accepts the connection. Both steps are easy to ignore and expensive to get wrong.

## DNS is a distributed phone book

People use names. Computers use addresses. The Domain Name System translates one into the other.

```text
browser
  |
  v
local resolver  --->  root nameserver
  |                        |
  |                        v
  |                   top-level domain
  |                        |
  |                        v
  +---------------->  authoritative nameserver for example.com
                           |
                           v
                      203.0.113.10
```

The resolver asks from the top down, then caches the answer for a while. Your operating system and browser also cache answers. A lookup that is already cached can be nearly free.

## Records you will see

- **A**: a name to an IPv4 address.
- **AAAA**: a name to an IPv6 address.
- **CNAME**: an alias from one name to another name.
- **NS**: the nameservers responsible for a domain.
- **MX**: the mail servers for a domain.
- **TXT**: arbitrary text, often used for domain verification and mail policy.

A CNAME points at a name, not directly at an address. The resolver follows the alias and then looks up the final address.

## TTL and propagation

Every DNS answer carries a **time to live (TTL)**. It tells caches how long they may reuse the answer.

```text
TTL = 60 seconds   -> changes spread in about a minute
TTL = 1 day        -> changes can take a day to reach everyone
```

Short TTLs make failover and migrations faster, but they increase lookup traffic and add a little latency when caches expire. Long TTLs reduce lookups but make changes slow.

"DNS propagation" is a misleading phrase. Nothing is pushed to every resolver. Old answers simply remain until their TTL expires. Plan changes around the largest TTL in the path.

## Routing with DNS

DNS can return different addresses for the same name.

- **Weighted**: send a share of traffic to each target. Useful for canary releases and unequal cluster sizes.
- **Latency-based**: send users to the region with the lowest measured latency.
- **Geographic**: send users to a region based on location, often for data residency.
- **Failover**: return a healthy target when the primary fails.

DNS health checks are coarse. A resolver may keep using an old answer until the TTL expires, and a client may cache even longer. DNS failover is useful, but it is not a substitute for a load balancer that can react in seconds.

## DNS as an attack surface

If users cannot resolve your name, they cannot reach your service, even if every server is healthy. DNS providers have been targets of large denial-of-service attacks.

Practical defenses:

- use more than one DNS provider or an anycast service;
- protect the registrar account with strong authentication;
- keep TTLs sensible for the failover plan;
- monitor resolution from outside your network;
- consider DNSSEC to detect tampering, while remembering it adds operational work.

## The reverse proxy

A **reverse proxy** accepts requests from the public and forwards them to internal services.

```text
client
  |
  v
[ reverse proxy ]  TLS, routing, compression, limits
  |          |
  v          v
[ app A ]  [ app B ]
```

It often handles:

- **TLS termination**: decrypt the public connection so backends do not each need certificates.
- **Routing**: send `/api` to the application and `/assets` to static storage.
- **Compression**: reduce response size.
- **Caching**: serve repeated responses without touching the app.
- **Static files**: return images, CSS, and scripts directly.
- **Limits**: cap request size, header size, and connections per client.
- **Hiding backends**: clients see one address, not the internal topology.

TLS termination concentrates certificates and CPU in one place. If regulation or threat model requires encryption inside the network too, re-encrypt the proxy-to-backend hop.

Do not confuse a reverse proxy with a **forward proxy**. A forward proxy acts on behalf of clients, often to reach the internet. A reverse proxy acts on behalf of servers, hiding them from clients.

## Load balancer versus reverse proxy

The terms overlap, but the intent differs.

- A **load balancer** distributes requests across several servers that perform the same function.
- A **reverse proxy** gives one public front door to one or more services, even when there is only one backend.

Many products do both. The question to ask is what problem you are solving: spreading load, or presenting a controlled edge.

```text
one backend, needs TLS and routing      -> reverse proxy is enough
many identical backends, needs spreading -> load balancer
many services under one hostname         -> reverse proxy plus routing
```

## Layer 4 and layer 7

A load balancer or proxy can work at different levels.

**Layer 4** looks at IP addresses and ports. It forwards packets without reading HTTP. It is fast and protocol-agnostic, but it cannot route by URL or header.

**Layer 7** reads the application protocol. It can route by path, host, header, or cookie, terminate TLS, and rewrite requests. It uses more CPU and must understand the protocol.

```text
L4: client IP + port -> backend IP + port
L7: GET /api/orders, Host: app.example.com -> orders service
```

Start with L7 when you need content-aware routing. Use L4 when you need simple, very high-throughput forwarding.

## What it costs

- Every proxy hop adds latency and another thing to operate.
- A single proxy is a single point of failure; a pair needs a failover plan.
- Caching at the edge can serve stale or private data if the cache key ignores authorization.
- DNS changes are slow because caches expire at different times.
- Terminating TLS at the edge moves trust: the internal network must still be treated as hostile if the data is sensitive.

## What to say in an interview

> "DNS uses a 60-second TTL with weighted records across two regions. A reverse proxy terminates TLS, serves static assets, compresses responses, and routes `/api` to the application tier. It also enforces request-size and rate limits. Behind it, a layer 7 load balancer distributes requests across stateless app servers and keeps unhealthy instances out of rotation."

That explains name resolution, the public edge, and how traffic reaches the app.
