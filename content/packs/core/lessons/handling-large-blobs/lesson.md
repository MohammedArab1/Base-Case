# Handling Large Blobs

A blob is a file or object: an image, a video, a PDF, a backup. The bytes can be large, and the metadata is small. Treat them as two different problems.

```text
control plane: who may upload, what the file is, whether it is ready
data plane:    the bytes themselves
```

The application server belongs in the control plane. The object store belongs in the data plane.

## Why not through application servers

An upload through an app server passes every byte through memory and the network stack. A 2 GB video consumes memory, a worker slot, and a long-lived connection. A few concurrent uploads can exhaust the server. Proxies add body-size limits and timeouts.

The object store is built for large transfers. It supports multipart upload, range reads, durability, and storage classes. Let it carry the bytes and keep the app server free to authorize and record.

## Presigned upload URLs

The API creates a short-lived URL that grants permission to write one object.

```text
client -> API:  POST /uploads {name, size, type}
API -> DB:      insert row status = pending
API -> client:  presigned PUT URL + object key
client -> store: PUT bytes
store -> queue: object created event
worker -> API:  verify object, mark uploaded
```

The URL is a capability. Scope it to one key, one method, an expiry, and a maximum size. Never let the client choose an arbitrary key, because it could overwrite another user's file.

A presigned URL does not prove the upload finished. The client can crash after the last byte. Treat the store event and a `HEAD` check as the source of truth, and reconcile pending rows.

## Multipart and resumable uploads

Large files are split into parts.

```text
file -> part 1, part 2, part 3, ...
        |        |        |
        v        v        v
      store    store    store
        \        |        /
         complete upload
```

Each part can be retried on its own, and parts can upload in parallel. Smaller parts mean more requests; larger parts mean more work to repeat after a failure. Typical sizes are a few megabytes to tens of megabytes, tuned to the network and store.

A resumable session stores the upload ID, part numbers, and checksums. After a network drop, the client asks which parts the store has and sends the rest. The store must expire incomplete sessions, or they become orphaned storage.

Keep a checksum per part and one for the whole object. Verify the whole-object checksum during the commit step, not only on the client.

## Metadata and status

The database holds the file record:

```text
file_id, owner_id, object_key, size, content_type,
checksum, status, version, created_at
```

Status is a state machine:

```text
pending -> uploaded -> scanning -> ready
                |          |
                v          v
            rejected    quarantined
```

A file is not ready because the bytes arrived. It is ready when the size and checksum match, the scan is clean, and any required variants exist. Make the complete call idempotent. A retried complete request must return the same result, not create a second file.

## Virus scanning

Scan asynchronously. Put new objects in a quarantine prefix or mark them `scanning`. A download service refuses anything that is not `ready`.

```text
upload -> quarantine -> scanner -> clean -> move to ready prefix
                            |
                            +-> infected -> delete, block, notify
```

Scanning every large video can take time. Set a size limit, scan metadata and archive contents where possible, and fail closed for file types the product considers risky. Do not scan inside the upload request, because the client would wait and the scanner would become part of the request path.

## Thumbnails and transcoding

Derived files are produced by workers.

```text
original -> image resizer -> thumbnail, medium, large
         -> video transcoder -> 360p, 720p, 1080p, manifest
```

Store each variant as its own object. Key it by content hash and transform version, so a retry writes the same object and a changed transform produces a new one. Record variant status in the metadata row. A video is not ready for playback until its manifest and required renditions exist.

Transcoding is long-running and CPU-heavy. Use a queue, limit concurrency, and report progress. Protect workers from decompression bombs and malformed media.

## Signed CDN downloads

Public files can be served from a CDN with a long cache lifetime and a versioned URL. Private files need a check before the bytes leave.

```text
client -> API: GET /files/42
API: authorize, check status = ready
API -> client: signed CDN URL, expires in 5 minutes
client -> CDN: GET
CDN -> store: fetch on miss
```

A signed URL or cookie limits who can fetch and for how long. Keep the lifetime short. Revocation is hard once a URL is shared, so never put permanent credentials in a URL.

Per-user signatures can reduce CDN cache hits, because every URL looks different. One pattern puts the signature in a cookie and strips it from the cache key. Video needs range requests so the player can seek without downloading the whole file.

## Deduplication and content hashing

Hash the content, then store one copy per hash.

```text
hash = sha256(bytes)
if blob exists:
    add a reference to the existing object
else:
    upload and store the new object
```

Reference counts decide when a blob can be deleted, or a mark-and-sweep job can find unreferenced objects. Client-side hashing lets the client skip an upload when the server already has the content, but the server must verify the claim.

Deduplication saves storage and upload time. It also creates privacy questions when users share the same bytes and complicates deletion. Encrypted per-user content usually cannot be deduplicated across users.

For file sync, content-defined chunking handles insertions better than fixed chunks. Fixed chunks are simpler and work well when files change at the edges.

## Lifecycle and retention

Object stores support rules:

- move old versions to cold storage;
- expire temporary uploads and incomplete multipart sessions;
- delete soft-deleted files after a retention window;
- keep legal holds.

Deletion must remove every variant, every chunk, and every reference. A metadata row that points at a missing object is a visible bug. An object with no metadata is invisible storage cost. Run a reconciliation job for both directions.

## Failure recovery

Common failures and responses:

- Upload stops halfway. Resume the multipart session or abort it after a timeout.
- Client never calls complete. A store event or sweep marks the row uploaded, then the normal pipeline continues.
- Object arrives but the event is lost. A periodic scan of the bucket finds objects without a matching row.
- Row is committed but the object write failed. Mark the row failed and let the client retry with the same idempotency key.
- Scan or transcode worker dies. The queue redelivers the job, and the worker writes the same derived key.

## Worked example: video upload and playback

1. The client requests an upload with the file name, size, type, and hash.
2. The API checks quota and permission, inserts a `pending` row, and returns multipart URLs.
3. The client uploads parts, retries failures, and calls complete with the part list and checksum.
4. The API verifies the object, marks it `scanning`, and enqueues a scan.
5. The scanner reads the object, finds it clean, and marks it `processing`.
6. A transcoder writes renditions and a manifest, then marks the row `ready`.
7. A viewer requests playback. The API checks permission and returns a short-lived signed manifest URL. The player fetches segments from the CDN.

If the scan finds malware, the object is deleted and the row is blocked. If transcoding fails, the original remains downloadable and the job is retried or sent to an operator.

## Trade-offs

- Direct upload uses fewer app-server resources, but it adds client and store logic.
- Synchronous processing is simpler to reason about, but it is slow and fragile for large files.
- An async pipeline is resilient and scalable, but the user sees intermediate states.
- Deduplication lowers storage cost, but it adds metadata and privacy work.
- Signed URLs improve access control, but they shorten cache lifetimes and add moving parts.

## What to say in an interview

> "The API only handles metadata and authorization. Clients upload directly to object storage with short-lived presigned multipart URLs. A complete call verifies size and checksum, then moves the file through scanning and transcoding before it is marked ready. Downloads go through a CDN with short-lived signed URLs, and private files are never public. We keep an idempotent status row, reconcile orphaned objects, and expire incomplete uploads."

That separates the control plane from the data plane and gives each failure a recovery path.
