# Network Protocols for System Design

Most system design failures are network failures wearing a disguise: a missing timeout, a retry that duplicates a charge, a connection pool that runs dry, or a protocol that promises more than it can deliver.

## Layers in plain language

```text
application   HTTP, RPC, WebSocket, DNS
transport     TCP, UDP, QUIC
network       IP addresses and routing
link          Wi-Fi, Ethernet, cellular
```

Each layer solves one problem and exposes a simpler contract to the layer above. The application does not manage packet loss; TCP does. TCP does not choose the route; IP does.

## HTTP

HTTP is a request/response protocol. The client sends a method, a path, headers, and sometimes a body. The server sends a status code, headers, and a body.

It is **stateless**: each request carries what the server needs. Login state lives in a cookie or token, not in the previous request.

Common methods:

| Method | Safe | Idempotent | Typical use            |
| ------ | ---- | ---------- | ---------------------- |
| GET    | yes  | yes        | Read a resource        |
| POST   | no   | no         | Create or trigger work |
| PUT    | no   | yes        | Replace a resource     |
| PATCH  | no   | no         | Partially update       |
| DELETE | no   | yes        | Remove a resource      |

**Safe** means the method does not change server state. **Idempotent** means repeating the request has the same effect as sending it once. Idempotency is about the effect, not the response code.

POST is not idempotent, which is why retrying a payment needs an idempotency key.

Status codes are grouped by meaning:

```text
2xx  success
3xx  redirect or not modified
4xx  the request is wrong
5xx  the server or a dependency failed
```

Use the existing meanings. A `200` with `{"error": ...}` makes caches, clients, and dashboards all guess wrong.

## Connections, caching, and versions

A TCP connection has setup cost. Keeping it open and reusing it avoids a handshake per request. That is **keep-alive**. A **connection pool** reuses a bounded set of connections across many requests.

HTTP caching uses headers:

- `Cache-Control` sets freshness and who may cache the response.
- `ETag` identifies a version; a conditional request can return `304 Not Modified`.
- `Vary` tells caches which request headers change the response.

Protocol versions change how connections are used:

- **HTTP/1.1**: one request at a time per connection in practice, so browsers open several connections.
- **HTTP/2**: many streams multiplexed over one connection, with header compression.
- **HTTP/3**: runs over QUIC instead of TCP and reduces head-of-line blocking, especially on lossy networks.

The version matters less than the timeout and retry behavior around it.

## TCP

TCP provides an ordered, reliable stream of bytes.

```text
client                              server
  | -------- SYN --------------->    |
  | <------- SYN-ACK ------------    |
  | -------- ACK --------------->    |
  | -------- request ----------->    |
  | <------- response -----------    |
```

It handles sequence numbers, acknowledgements, retransmission, flow control, and congestion control. The application sees a stream, not packets.

Costs:

- handshake round trips before data flows;
- retransmission delays when packets are lost;
- head-of-line blocking: one lost segment can delay later bytes on the same connection;
- memory per open connection.

Use TCP when every byte must arrive in order: web traffic, database connections, file transfer, email.

## UDP

UDP sends independent datagrams. It does not guarantee delivery, order, or duplicate suppression, and it does not provide congestion control by itself.

That sounds bad until you need low latency and can tolerate loss.

```text
TCP: wait for the missing packet -> smooth but later
UDP: skip the missing packet    -> timely but incomplete
```

Use UDP for real-time voice and video, games, telemetry, and some DNS traffic. If you need reliability, build only what you need on top, or use QUIC, which adds reliability and congestion control over UDP.

## RPC

Remote procedure call makes a network call look like a local function.

```text
client code -> stub -> network -> server stub -> service method
```

The stub serializes arguments and results. A schema, often with code generation, keeps both sides aligned. gRPC is a common example: HTTP/2 transport, protocol buffers, and support for streaming.

RPC is a good fit for internal service-to-service calls where you control both sides and want a tight contract. It is a poor fit when clients need a stable public interface that evolves independently, because the client is coupled to the procedure shape.

## REST, RPC, and GraphQL

- **REST** exposes resources through URLs and standard methods. It is stateless, cacheable, and familiar for public APIs.
- **RPC** exposes actions. It is efficient and explicit for internal calls, but couples clients to procedures.
- **GraphQL** lets the client ask for a specific shape in one request. It reduces over-fetching and round trips, but adds query-complexity limits, caching challenges, and a new attack surface.

The right choice depends on who the client is and how the interface will change.

## Timeouts, retries, and deadlines

Every network call needs a deadline. "It usually responds" is not a failure strategy.

```text
bad:  wait forever
good: 300 ms deadline, then fall back or fail clearly
```

Retry only when the operation is safe to repeat:

- GET, PUT, and DELETE are usually safe to retry.
- POST needs an idempotency key.
- A retry needs exponential backoff and jitter.
- A retry needs a maximum attempt count.
- A circuit breaker should stop calls to a dependency that is clearly down.

Without these limits, a brief outage becomes a retry storm that keeps the dependency down.

## What it costs

- Cross-region calls add tens to hundreds of milliseconds before any work happens.
- TLS and connection setup add round trips; pools and session resumption reduce them.
- Large responses cost bandwidth and serialization time.
- Chatty APIs turn one user action into many round trips.
- Retries improve success rates and increase load; both effects are real.

## What to say in an interview

> "Public clients use REST over HTTPS with ETags and a two-second deadline. Internal calls use gRPC over HTTP/2 with a 300 ms deadline. Retries use exponential backoff with jitter, a maximum of three attempts, and an idempotency key for writes. Chat uses a persistent WebSocket because it needs low-latency bidirectional messages; presence updates tolerate loss and are refreshed periodically."

That names the protocols, the deadlines, the retry policy, and why each transport fits.
