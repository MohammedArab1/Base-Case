# Reference design: file sync

This is one reasonable answer. The key separation is between immutable content blocks and the mutable metadata tree that decides which blocks belong to a file version.

## APIs

```text
GET  /namespaces/{ns}/changes?cursor=...
POST /namespaces/{ns}/upload-sessions       { path, size, contentHash }
PUT  /upload-sessions/{id}/blocks/{hash}    (signed object-storage URL)
POST /upload-sessions/{id}/commit           { parentVersion, blocks[], mtime, mode }
GET  /namespaces/{ns}/files/{fileId}/versions
POST /namespaces/{ns}/files/{fileId}/restore { versionId }
GET  /namespaces/{ns}/files/{fileId}/download
```

The client keeps a per-namespace cursor. `GET /changes` returns committed metadata changes after that cursor and a new cursor; it never returns uncommitted blocks.

## Data model

```text
namespaces(id, owner_id, quota_bytes, region)
files(id, namespace_id, path, current_version_id, deleted_at)
versions(id, file_id, parent_version_id, size, content_hash, created_by_device, created_at)
version_blocks(version_id, ordinal, block_hash, block_size)
blocks(hash, size, ref_count, storage_key, created_at)
devices(id, user_id, name, last_seen_at, cursor)
change_log(namespace_id, seq, entity_type, entity_id, version_id, operation, created_at)
upload_sessions(id, namespace_id, path, state, expires_at)
```

- `blocks.hash` is a content hash, so identical bytes are stored once.
- `change_log.seq` is monotonic per namespace. The cursor is a position in this log.
- A file version is immutable once committed. Editing creates a new version that points at a parent.

## Upload and commit

1. The client splits the file into fixed-size blocks (for example 4 MB), hashes each block, and computes a whole-file hash.
2. It creates an upload session. The metadata service returns the blocks that are missing from storage.
3. The client uploads missing blocks directly to object storage using short-lived signed URLs.
4. The client commits with the ordered block list and the parent version it edited.
5. In one metadata transaction, the service verifies every block exists, checks the parent version, inserts the new version and block links, updates the file pointer, appends to the change log, and returns success.
6. Only after that commit is the upload durable from the user's perspective. A block upload alone is not a file.

If the client crashes before commit, the session expires and its orphaned blocks are reclaimed later. If the commit succeeds but the response is lost, retrying with the same session and parent version is idempotent.

## Delta sync and offline catch-up

- Online devices subscribe to a notification stream keyed by namespace. The notification carries only the new sequence number, not file contents.
- On wake or reconnect, a device reads `changes?cursor=...` and applies metadata changes in order.
- It downloads only blocks it does not already have, verified by hash.
- Applying a change is idempotent: a device can replay the same range safely.
- If the cursor is older than the retained change log, the server returns a snapshot plus a fresh cursor. Clients must handle that reset path.
- The client stores pending local edits with their base version id. On reconnect it uploads or reconciles them.

## Conflict resolution

Each commit names its `parentVersion`. The metadata service uses a compare-and-swap on the file's current version:

- If the parent matches, commit normally.
- If it does not, return `409 conflict` with the current version summary.

The default policy is **preserve both**: the losing client uploads its content as a conflict copy, for example `report (conflict from laptop 2026-10-25).docx`, and the original file keeps the winning version. This never discards user data. The UI explains which device produced each copy and offers a merge or keep-one action.

An alternative for structured documents is operational-transform or CRDT merge, but that requires application-specific semantics and is not a general file-sync default.

## Architecture

```text
Clients -> API gateway -> metadata service -> PostgreSQL (sharded by namespace)
   |                         |                    |
   |                         +-> change log       +-> notification service
   +-> object storage (blocks) <------------------+
                                      |
                              garbage collector
```

- **Metadata service:** validates paths, versions, quotas, and permissions; writes the change log.
- **PostgreSQL:** sharded by namespace, with a per-namespace sequence for ordering.
- **Object storage:** immutable blocks addressed by hash; replicated within a region.
- **Notification service:** fan-out of sequence numbers over WebSocket or long polling; no file data.
- **Garbage collector:** decrements block references for deleted versions and removes unreferenced blocks after a grace period.

## Scale

Twenty million commits per day is about 230 per second average, with bursts at the start of the workday. Five hundred million reads per day is about 5,800 QPS average.

- Metadata is small compared with content; shard by namespace and keep hot namespace metadata cached.
- Object storage absorbs block traffic and scales independently.
- Most uploads send only changed blocks because the client already has most hashes.
- Notifications are tiny; batch sequence numbers per namespace to avoid a storm when a large folder changes.
- A hot shared folder can concentrate reads; cache metadata and use a CDN or edge cache for read-heavy blocks where privacy allows.
- Large files upload in parallel blocks, but the commit remains one atomic metadata operation.

## Trade-offs

- **Fixed-size vs content-defined chunking:** fixed blocks are simple and fast; content-defined chunking handles insertions better but costs more CPU. Start with fixed blocks and measure dedupe.
- **Client-side vs server-side dedupe:** client-side avoids uploading duplicate blocks but reveals hashes; server-side is simpler but wastes bandwidth. Hash only block contents, never filenames or user identifiers.
- **Strong vs eventual metadata consistency:** a single authoritative metadata transaction prevents lost updates; cross-region replication is eventually consistent. Route writes to the namespace's home region.
- **Push vs poll:** push reduces latency; poll is simpler and survives notification outages through the same cursor API. Run both: push as an optimization, catch-up as the correctness path.
- **Keep all versions vs garbage collection:** retention is valuable for restore but grows storage. Keep recent versions and tier older ones to cold storage.
- **Conflict copies vs automatic merge:** conflict copies are safe and general; automatic merge is better UX only for formats that support it.

## Failure modes and monitoring

- **Partial upload:** uncommitted blocks are invisible; sessions expire and the collector removes orphans.
- **Commit response lost:** retry with the same session and parent version; the commit is idempotent.
- **Metadata database failover:** in-flight commits fail; clients retry. The change log sequence prevents gaps.
- **Notification outage:** clients fall back to cursor polling. Alert on notification lag.
- **Storage corruption:** verify hashes on read, re-upload from another device, and quarantine the bad block.
- **Cursor too old:** serve a snapshot and reset the client cursor; alert if this happens often.
- **Runaway storage:** alert on orphan-block age and ref-count drift; run a reconciliation job that compares metadata references with storage.
- **Monitoring:** commit latency, conflict rate, upload session failure rate, notification lag, cursor reset rate, dedupe ratio, storage growth, and restore success rate.
