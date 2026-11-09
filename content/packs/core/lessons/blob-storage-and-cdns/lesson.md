# Blob Storage and CDNs

A user uploads a 3 MB photo. The application stores the row that describes the photo, but the photo itself goes somewhere else. That separation is the core of blob storage design.

## Keep bytes out of database rows

A relational row works best when it is small, structured, and queried. A photo or video is large, opaque, and fetched by key. Putting the bytes in a row creates problems that grow with every upload:

- backups and replicas copy the media along with the metadata;
- the buffer cache fills with bytes instead of hot rows;
- write-ahead logs and replication streams carry large payloads;
- a restore takes hours longer than it needs to.

The size matters. At 2 million photos per day and 3 MB per photo, the system adds 6 TB every day. A year of raw originals passes 2 PB before replicas. A database can survive small attachments, but large media belongs elsewhere.

Use row storage for a blob only when it is small, fixed-size, and must commit with the row. Check the engine's limits and measure the cost.

## Object storage

An object store maps a bucket and key to an immutable sequence of bytes.

```text
bucket: photos-origin
key:    2026/11/08/user-42/8f2a.jpg
value:  the bytes
```

The model is narrow. You can put, get, copy, and delete whole objects. You can list keys by prefix. You cannot update a byte range in place, join objects, or run a query over their contents. A replacement creates a new version or a new key.

S3, GCS, and Azure Blob all follow this shape. They spread objects across devices and facilities with replication or erasure coding, and they present a durability target rather than a single disk. That target covers hardware loss. It does not cover an application that deletes the wrong prefix, so versioning and backups still matter.

Read-after-write is usually strong for new objects. Overwrite and delete behavior varies, so verify the current guarantee.

## Metadata stays in the database

The database holds the facts that change and need queries.

```text
files
  id            uuid
  owner_id      uuid
  object_key    text unique
  size_bytes    bigint
  content_type  text
  checksum      text
  status        pending | ready | quarantined
  version       integer
  created_at    timestamp
```

The metadata row decides who may see a file. The object store holds the bytes. A reader checks metadata first, then fetches the object. Keeping the row small makes ownership checks, listings, sharing, and deletion fast.

Generate the object key on the server. Never accept a client-supplied path, because `../` and bucket-wide prefixes become an authorization bug.

## Presigned URLs and direct uploads

A presigned URL is a time-limited signature that authorizes one operation on one object. The API server creates the signature without handling the bytes.

```text
client -> API:      POST /files {name, size, type}
API -> database:    insert row, status = pending
API -> client:      upload URL, object key, expiry = 5 min
client -> storage:  PUT bytes
client -> API:      POST /files/{id}/complete
API -> storage:     HEAD object, verify size and checksum
API -> database:    status = ready
```

Downloads use the same idea. The API checks permission, then returns a short-lived GET URL or a CDN signed URL.

Direct uploads keep the application servers out of the data path. The API does not buffer 12 MB videos, pay for double bandwidth, or hold a worker for the length of a slow mobile upload. The trade-off is that authorization happens when the URL is signed. Revoking it before expiry is hard, so keep the expiry short and scope the signature by method, key, content type, and maximum size.

## Multipart uploads

A large file is split into parts, often 8 to 16 MB each. The client uploads parts in parallel and retries only the parts that fail. The storage service returns an entity tag for each part, and a final complete call assembles them.

Multipart upload gives three things:

- **Resume**: after a disconnect, list the uploaded parts and continue.
- **Throughput**: parallel parts use more of the available link.
- **Integrity**: checksum each part, then checksum the assembled object.

The failure mode is an abandoned upload. A phone dies after sending 40 of 100 parts, and the storage keeps them. Add a lifecycle rule that aborts incomplete multipart uploads after one to seven days.

## Durability, versions, lifecycle, and encryption

- **Versioning** keeps previous bytes when an object is replaced or deleted. It protects against mistakes and ransomware, and it costs storage. A delete usually writes a delete marker rather than removing history.
- **Lifecycle rules** move objects to colder tiers after an age or prefix match, expire temporary exports, and clean up incomplete uploads. They are the main control on storage cost.
- **Encryption** covers TLS in transit and encryption at rest. Regulated data may need customer-managed keys. Key access is a separate permission from object access.
- **Cross-region replication** supports disaster recovery. State the recovery point objective, because a copy that lags by an hour is not the same as a synchronous replica.

A durability claim such as eleven nines describes hardware failure. It does not protect against a bad deploy that removes a bucket.

## Serving through a CDN

A pull CDN fetches from the origin bucket on the first request and serves later requests from an edge location.

```text
viewer -> edge cache -> (miss) -> origin bucket
viewer <- edge cache
```

Public assets use a long TTL and a content-hashed or versioned key. When the asset changes, publish a new key. The old key ages out on its own. This is safer than purging, because a purge is best effort and may take minutes to reach every edge.

Private files need a signed URL or a signed cookie. The edge checks the signature and expiry. The origin checks again. Never cache one user's private object under a shared key, even for a short time.

```text
public, max-age=31536000, immutable   # hashed asset
private, max-age=60                   # user-specific response
no-store                              # secrets and one-time links
```

## Cost

Storage, requests, and egress are separate prices. Show which term dominates.

At 6 TB per day with 30-day retention, the hot tier holds about 180 TB. At $0.023 per GB-month, that is roughly $4,200 per month before replication. Move older originals to a cold tier and the number drops. Keep a year without lifecycle rules and the bill approaches $50,000 per month.

Egress often costs more than storage. If 20 million views per day fetch 3 MB each, that is 60 TB per day. At $0.05 per GB, egress is about $3,000 per day. Resizing images, serving modern formats, and caching at the edge reduce this far more than negotiating a storage rate.

## Worked photo upload

Assume 2 million uploads per day, 3 MB average, 12 MB at p95, and 20 million views per day.

```text
upload
  phone  -> API:        create upload
  API    -> database:   pending metadata row
  API    -> phone:      presigned multipart URLs
  phone  -> storage:    parts in parallel
  phone  -> API:        complete upload
  API    -> storage:    HEAD and checksum
  API    -> database:   status = ready
  API    -> queue:      thumbnail job
  worker -> storage:    read original, write three sizes
  worker -> database:   record variant keys

read
  viewer -> CDN:        GET /photos/123/v7/medium.jpg
  CDN    -> storage:    fetch on miss
  CDN    -> viewer:     bytes
```

The version in the path makes a replacement safe: publish `v8`, and no edge can serve `v7` bytes under the new name. Metadata lookups stay indexed and small. The bytes never pass through the API tier.

Failure cases to name:

- The client uploads but never calls complete. A reconciler finds pending rows and old objects; lifecycle deletes the orphans.
- Complete arrives before the object is readable. The HEAD check fails, and the client retries with backoff.
- Metadata says ready but the object is gone. Reads return 404, an alert fires, and the version history or backup is the repair path.
- A signed URL leaks. Short expiry limits the window, and access logs support abuse detection.
- A popular object is replaced in place. The edge may serve the old bytes, so use a new key instead.

## What to say in an interview

> "The metadata row lives in the primary database with owner, checksum, status, and object key. The client gets a five-minute presigned URL and uploads directly to object storage, using multipart for files over 8 MB. The commit endpoint verifies the object, flips status to ready, and enqueues thumbnail generation. Reads go through a pull CDN with versioned keys and a long TTL. We keep versioning and lifecycle rules for recovery and cost, and we never put the bytes in the database."

That covers path separation, authorization, integrity, delivery, and cost.
