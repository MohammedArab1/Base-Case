# ADR-0004: Store local state in SQLite with append-only migrations

- Status: Accepted
- Date: 2026-10-23
- Deciders: Maintainer
- Supersedes: —

## Context

The app stores content pack metadata, problems, attempts, events, mistake tags,
review cards, design attempts, settings, and AI provider metadata. Data must
survive crashes, be backed up and exported, and remain queryable without a
server. Search needs full-text indexing.

## Decision

Use a single SQLite database under Electron's `userData` directory, in WAL mode,
with FTS5 for search. Use hand-written, numbered, append-only migrations that
run in a transaction. Back up the database before destructive migrations and
keep the last seven verified backups. Use TEXT IDs (stable slugs for content,
UUIDs for user records), ISO-8601 timestamps, and JSON columns validated in
application code.

The driver decision (`better-sqlite3` vs. `node:sqlite`) is deferred to the
Phase 1 spike, because it depends on the Electron/Node version and packaging
behavior.

**Phase 1 result:** `node:sqlite` is available in Electron 45 and passed the
spike (WAL, migrations, `VACUUM INTO` backups, attempts, drafts, and canvas
scenes) without a native rebuild. Use `node:sqlite` provisionally for Phase 2.
Revisit if the experimental API changes or FTS5 behavior is insufficient.

## Consequences

Positive:

- Mature, local, transactional storage with a small operational surface.
- FTS5 supports offline problem search without a service.
- A single file is easy to back up, export, and inspect.
- Append-only migrations keep upgrades auditable.

Negative:

- Native driver packaging may require `electron-rebuild` and per-arch builds.
- JSON columns are not strongly typed at the database layer; application
  validation is mandatory.
- Users can corrupt the file with external tools; backups and repair flows must
  be tested.

## Alternatives considered

- **JSON files:** Simple, but weak for queries, transactions, review scheduling,
  and history.
- **IndexedDB in the renderer:** Keeps data near the UI but couples durability
  to the renderer and complicates export.
- **Hosted database:** Violates local-first and offline requirements.

## Follow-up

- Decide the driver in Phase 1 using the Electron Node version, packaging
  results, and a small benchmark.
- Test empty-install and previous-schema upgrades in CI.
