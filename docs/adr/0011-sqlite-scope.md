# ADR-0011: Keep pack content file-backed and scope SQLite to user state

- Status: Accepted
- Date: 2026-10-24
- Deciders: Maintainer
- Supersedes: Partially amends ADR-0004 and Section 4.3 of `PLAN.md`

## Context

`PLAN.md` Section 4.2 and 4.3 outline normalized tables for content packs,
problems, tests, hints, and reference solutions in addition to user state. The
current implementation instead treats validated pack directories as the source
of truth, loads them into memory at startup, and rebuilds an FTS5 index for
search. Pack installation is an atomic directory move, and packs are read-only
after installation.

Mirroring that content into SQLite would introduce a second write path for every
install and upgrade. It would also require reconciling pack versions, handling
partial writes, and migrating content rows whenever the pack schema changes.
Phase 2 has no query that needs SQL joins across content tables: the app reads
content from packs and searches through `problem_search`.

## Decision

Keep pack content file-backed and scope SQLite to local user state and derived
indexes:

- Pack directories remain the source of truth for pack metadata, problems,
  tests, hints, solutions, and design scenarios.
- SQLite stores settings, attempts, drafts, design scenes, AI provider metadata,
  attempt events, mistake tags, review cards, design attempts, per-problem
  notes, the FTS search index, and migration history.
- Migration 3 adds `attempt_events`, `mistake_tags`, `attempt_mistake_tags`,
  `review_cards`, and `design_attempts`. Migration 4 adds `problem_notes`.
  `review_cards`, and `design_attempts` for the coding, review, and design
  phases.
- Do not add `content_packs`, `problems`, `problem_tests`, `problem_hints`,
  `problem_solutions`, or `design_scenarios` in Phase 2.
- If a later feature needs content rows in SQL (export/import, diagnostics, or
  analytics), add a rebuildable derived table populated from packs rather than
  dual-writing during normal operation.

## Consequences

Positive:

- One source of truth for content; installing or removing a pack cannot leave
  the database and filesystem out of sync.
- Pack imports stay atomic and validation stays in the content layer.
- The user-state schema can evolve without content-schema migrations.
- Startup and pack changes rebuild the search index through one path.

Negative:

- Content cannot be joined with user state in SQL without loading packs.
- Diagnostics and future analytics need an explicit export/reindex step.
- Someone expecting the full Section 4.3 shape will find content tables absent;
  this ADR and the notes in `PLAN.md` are authoritative.

## Alternatives considered

- **Mirror all content into SQLite:** Rejected for Phase 2. It doubles writes,
  complicates pack upgrades, and has no query benefit today.
- **Store content only in SQLite:** Rejected. Packs must remain portable,
  reviewable, diffable, and importable without database migrations.
- **Cache content rows lazily:** Deferred. A rebuildable derived table is the
  preferred approach if a concrete need appears.

## Follow-up

- Add repositories for attempt events, mistake tags, review cards, design
  attempts, and per-problem notes when those features grow beyond the current
  inspector and repository surface.
- Document the export/import path for user state and packs in Phase 4.
