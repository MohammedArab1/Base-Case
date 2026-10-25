# Design a file sync service

You are designing a cross-device file sync service. A user edits a document on a laptop, closes the lid, and expects the change to appear on a phone and another desktop shortly after reconnecting. Devices may be offline for days, and two devices may edit the same file at once.

## Scope

Focus on file metadata, block storage, upload/download, change propagation, offline catch-up, versions, and conflict handling. Sharing permissions, billing, and a web editor are out of scope, but state assumptions about them.

## Requirements

### Functional

- Upload and download files and folders across devices.
- Propagate changes to other online devices within seconds.
- Support offline edits and reconnect without data loss.
- Keep file versions and allow restoring an earlier version.
- Resolve concurrent edits with a predictable conflict policy.

### Non-functional

- Acknowledged uploads must be durable and never silently lost.
- Metadata operations should stay fast even for large folders.
- Deduplicate identical content to control storage growth.
- Reconnect and catch up efficiently after a long offline period.
- The system must tolerate partial uploads, retries, and device crashes.

## Scale

- 50 million devices.
- 20 million file-change commits per day.
- 500 million metadata and block-read requests per day.
- 5 years of retention for versions and audit data.
- Individual files can reach 100 GB; most are under 10 MB.

## What to produce

1. The metadata and block APIs.
2. The data model for files, versions, blocks, and devices.
3. A high-level architecture.
4. Two or three deep dives: upload commit, delta sync, and conflict resolution.
5. The main trade-offs.
6. Failure modes, garbage collection, and monitoring.
