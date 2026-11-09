# Pushing Real-Time Updates

A product asks for live comments, live scores, or a shared cursor. The instinct is to open a WebSocket. Often a short poll would meet the requirement with far less machinery.

_This lesson follows the Common Patterns part of a curriculum structured around the HelloInterview System Design in a Hurry outline. The explanations and examples are original._

## Choose the smallest mechanism

```text
polling        client asks every N seconds
long polling   server holds the request until data or timeout
SSE            one long HTTP response, server -> client
WebSocket      one connection, both directions
```

**Polling** is a repeated request. It is stateless, easy to cache and load balance, and works everywhere. The cost is latency up to the interval and wasted requests when nothing changed. A five-second poll for a notification badge is usually fine.

**Long polling** keeps a request open until the server has an event or the request times out. The client immediately reconnects. It reduces empty responses and works through most proxies, but each update still needs a new request, and reconnect churn can be high.

**Server-Sent Events (SSE)** keep one HTTP response open and stream text events. The browser reconnects automatically, and `Last-Event-ID` supports resume. SSE is one-way: server to client. It fits feeds, notifications, progress bars, and live scores. The client sends commands through normal HTTP requests.

**WebSockets** upgrade an HTTP connection to a persistent, bidirectional channel. After the handshake, frames have low overhead. This fits chat, collaborative editing, multiplayer state, and any feature where both sides send frequent small messages. The cost is stateful connection management.

Start with polling. Move to SSE when the server pushes often and the client only listens. Move to WebSockets when the client also sends frequent messages or needs the lowest latency.

## Stateless HTTP, stateful connections

An HTTP request can land on any server. A WebSocket connection is pinned to the server that accepted it.

```text
HTTP:      client -> any API instance
WebSocket: client <-> gateway instance 7
```

That pinned state changes deployment, scaling, and failure handling. If gateway 7 dies, every client on it reconnects. The design needs a reconnect path, not a hope that servers stay up.

Keep the source of truth outside the connection. The socket carries updates; the database and log store them.

## Load balancing persistent connections

Long-lived connections do not balance like short requests. Round robin at connect time can leave one gateway with many idle sockets and another with heavy ones.

Common choices:

- layer 4 load balancing by connection, with least-connections or hashing;
- a layer 7 gateway that understands the WebSocket upgrade;
- connection-aware routing through a registry;
- consistent hashing when a room or user should stay on one gateway.

Plan for deploys. Draining a gateway means stopping new connections, letting existing ones finish or asking clients to reconnect to another node. A reconnect storm after a deploy can look like an outage.

## Publish and fan out

A gateway that holds a connection is not the place to decide who should receive a message. Use a publish/subscribe layer.

```text
message service -> topic "user:41" -> gateways subscribed to user 41
```

A simple approach subscribes each gateway to the channels of its connected users. The message service publishes once, and only gateways with interested clients receive it.

For a large room or a celebrity post, per-user topics explode. Use a topic per conversation or a sharded stream, and let each gateway read the partitions it needs. The fan-out strategy is the same trade-off as a news feed: do work at write time or at read time.

## Presence and typing indicators

Presence is a hint, not a fact. A client can lose connectivity without a clean close.

Use a heartbeat and a short TTL:

```text
connect    -> set presence:user:41 = gateway-7, TTL 30s
heartbeat  -> refresh TTL every 10s
disconnect -> delete key
crash      -> key expires
```

Multi-device presence needs one entry per device, then a rollup. Do not mark a user offline the moment one socket closes if another device is still connected.

Typing indicators are ephemeral. Send them at most a few times per second, expire them after a few seconds, and do not store them in the database. Losing a typing event is acceptable; losing a chat message is not.

## The connection registry

A registry maps users to connections.

```text
user 41 -> [gateway-7/conn-a, gateway-3/conn-b]
```

It supports targeted delivery, presence, and operational queries. Store it in a shared store with TTLs, and update it on connect and disconnect. The registry is a routing aid. If it is briefly stale, the client still reconnects and resumes.

## Reconnect and resume

Networks drop. Clients must reconnect without losing messages or showing duplicates.

Give every message in a conversation a sequence number.

```text
client last seen: conversation 9, seq 1042
reconnect -> "resume after 1042"
server -> replay 1043, 1044, ...
```

SSE uses `Last-Event-ID` for the same purpose. The server keeps a replay buffer or reads from a durable log. If the requested position is too old, the client fetches a fresh snapshot and then resumes.

Sequence numbers should be per conversation or channel, not one global counter, unless the product needs a total order.

## Backpressure and slow consumers

A slow client can make the server queue updates in memory.

```text
fast producer -> gateway -> slow socket -> growing buffer
```

For each connection, keep a bounded outbound queue. When it fills:

- drop or coalesce ephemeral updates such as cursor position or presence;
- send a snapshot instead of a long series of deltas;
- disconnect the client with a clear close code so it reconnects and resyncs.

Never drop durable chat messages. Persist them and let the client replay. The socket is a delivery path, not the source of truth.

## Missed messages and delivery

Assume at-least-once delivery. Give each message an ID and let the client deduplicate. Order within a conversation, and do not promise a global order across conversations.

If the client is offline, store the message and send a push notification. The notification is a nudge; the app still fetches the message from durable storage.

For live scores or likes, the latest value is enough. Coalesce old updates and send only the current state.

## Multi-region

Put gateways near users and route each connection to the nearest region. A user in Europe should not have every keystroke cross an ocean.

```text
EU clients -> EU gateway -> regional pub/sub
US clients -> US gateway -> regional pub/sub
```

Cross-region rooms need a bridge between regional buses. Decide which region owns the room's order, or accept merge rules for concurrent updates. Presence can stay regional with a global rollup. The wider the fan-out, the more the design pays in latency and cost.

## Cost

Each open connection consumes a file descriptor, memory, and a heartbeat. Idle connections are not free. Fan-out multiplies work, and cross-region replication adds bandwidth.

Polling is often cheaper at low scale and easier to operate. Measure the request rate and the required freshness before adding a stateful tier.

## Worked example: chat

```text
sender -> API -> persist message (conversation seq)
              -> publish to conversation channel
              -> recipient gateway -> live socket
              -> offline? push notification
```

The API writes the message and its sequence number in one transaction, then publishes. The recipient's gateway pushes it. The client acknowledges, and the sender sees a delivered state. On reconnect, the client sends its last sequence number and the server replays the gap. Duplicate IDs are ignored. A slow client gets a bounded queue and a resync, not an unbounded memory leak.

## What to say in an interview

> "Notifications use SSE because the server pushes and the client does not send on the same channel. Chat uses WebSockets because messages flow both ways. Gateways are layer 4 load balanced, connections register in a shared map with TTLs, and messages carry per-conversation sequence numbers so a reconnect can replay the gap. Presence and typing are ephemeral and may drop."

That states the mechanism, the state, the failure path, and what the product tolerates.
