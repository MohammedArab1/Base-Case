# Design a chat system

You are designing the backend for a messaging product with one-to-one and group chats. Clients keep a persistent connection while they are online and fall back to push notifications when they are not.

## Scope

Focus on message delivery, ordering, storage, and multi-device sync. Media attachments are allowed as a mention, but the storage details can stay high level. End-to-end encryption and spam/abuse systems are out of scope, though you should state your assumptions.

## Requirements

### Functional

- Support one-to-one and group conversations.
- Deliver messages in real time and persist them for history.
- Show delivery and read receipts.
- Deliver messages to offline users and sync across multiple devices.
- Expose presence and typing indicators.

### Non-functional

- Deliver messages with low latency within a region.
- Preserve per-conversation order and never silently lose a message.
- Tolerate reconnects and duplicate delivery without showing duplicates.
- Scale to tens of millions of daily users and hundreds of millions of messages.
- Degrade gracefully to push notifications when a device is offline.

## Scale

- 500 million messages per day.
- 5 billion reads per day across history and sync.
- Keep messages for 5 years.

## What to produce

1. The client-server protocol and message envelope.
2. The ordering model.
3. The data model and storage choices.
4. A high-level architecture for send, deliver, and sync.
5. The main trade-offs.
6. Failure modes and monitoring.
