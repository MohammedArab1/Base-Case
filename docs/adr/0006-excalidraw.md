# ADR-0006: Use Excalidraw for the system design canvas

- Status: Accepted
- Date: 2026-10-23
- Deciders: Maintainer
- Supersedes: —

## Context

System design practice needs a low-friction diagramming surface with boxes,
arrows, text, grouping, and a serializable scene. Building a canvas from scratch
would consume the schedule and produce a worse tool. The canvas must work
offline and save scenes locally.

## Decision

Embed the Excalidraw React component. Persist scene JSON in SQLite, version the
scene format, and support PNG/SVG export. Ship a small reference scene per
design scenario. Treat the canvas as a drawing surface, not as a structured
diagram model.

## Consequences

Positive:

- Polished drawing experience with a familiar interaction model.
- MIT licensed and offline-capable.
- Scene JSON is serializable and can be exported/imported.
- Reference designs can be shipped as scene files.

Negative:

- Adds significant renderer bundle size.
- The scene format is externally owned and must be versioned/pinned.
- Freehand drawing is not fully screen-reader accessible; a text summary and
  notes are required.
- AI review of drawings is out of scope; only written notes are reviewed.

## Alternatives considered

- **Custom canvas:** Full control, but expensive and unlikely to match
  Excalidraw's usability.
- **tldraw:** Strong product, but licensing and bundle trade-offs need review.
- **Mermaid text diagrams:** Accessible and structured, but less natural for
  interview-style sketching.

## Follow-up

- Pin the Excalidraw version and test scene restore across upgrades.
- Measure canvas performance with 100+ elements in Phase 1.
- Provide a text summary field for accessibility and AI context.
