# ADR-0012: Keep lessons in packs and lesson progress in SQLite

- Status: Accepted
- Date: 2026-10-27
- Deciders: Maintainer
- Extends: ADR-0003 and ADR-0011

## Context

The app needs an offline learning library that explains DSA and system-design
concepts before the learner practices them. Lessons contain long-form Markdown,
diagrams, complexity tables, and links to problems or design scenarios.

Two storage questions follow:

1. Are lessons content or user state?
2. How is completion tracked without creating a second review system?

Lessons are authored, validated, versioned, and imported with a pack. They are
not created by the learner. Completion is user state and must survive pack
removal and export/import.

## Decision

- Lessons are file-backed pack content under `lessons/<slug>/lesson.json` and a
  referenced Markdown file. They are listed in `pack.json` under `lessons`.
- Lesson IDs, slugs, prerequisites, and exercise links are validated with the
  same pack rules as problems and designs.
- Lessons are loaded into memory at startup. They are not mirrored into SQLite.
- SQLite stores only `lesson_progress` (`lesson_id`, `completed_at`,
  `last_viewed_at`, `updated_at`). Migration 8 creates the table.
- Lesson completion is independent of the FSRS review scheduler. Completing a
  lesson does not create a review card.
- `lesson_progress` is included in user-data export/import. If a pack is
  removed, the row remains harmless and is ignored until a lesson with that ID
  is available again.
- AI clarification is an optional feature. Its context contains the lesson
  title, summary, key points, complexity rows, a selected section excerpt, and
  the learner's question. It never includes self-check answers, common
  mistakes, or reference solutions.

## Consequences

Positive:

- Lessons stay portable, reviewable, diffable, and importable with the rest of
  a pack.
- Correcting a lesson does not require a database migration.
- Completion is durable, exportable, and independent of AI or the network.
- The learning library reuses the existing sanitization, IPC validation, and
  content-loading boundary.

Negative:

- A lesson cannot be joined with user state in SQL without loading the pack.
- Renaming a lesson ID loses the link to existing progress. IDs are therefore
  stable, like problem IDs.
- Lesson content that grows very large is still loaded into memory at startup;
  the current cap is small enough that this is acceptable.

## Alternatives considered

- **Store lessons in SQLite:** Rejected. It duplicates the pack pipeline and
  makes content updates into migrations.
- **Track completion as a setting or JSON blob:** Rejected. It is less
  queryable, harder to export, and invites accidental overwrites.
- **Create FSRS cards for lessons:** Rejected for this feature. Reading
  completion is not the same signal as recall practice. A future lesson-review
  mode can introduce its own scheduling model.
- **Send the entire lesson to the AI provider:** Rejected. It increases token
  cost and unnecessarily includes self-check answers. The selected excerpt is
  enough.

## Follow-up

- Consider prerequisite cycle detection if the lesson graph grows beyond the
  curated core path.
- Consider a lesson review mode with its own scheduling, separate from FSRS
  problem cards.
