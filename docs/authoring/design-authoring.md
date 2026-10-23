# System design authoring guide

## Required files

```
designs/<slug>/
├─ design.json
├─ prompt.md
├─ rubric.json
├─ reference.md
└─ reference.excalidraw.json
```

Start from `content/templates/design/`.

## Scenario

Include:

- product context and prompt;
- functional requirements;
- non-functional requirements with measurable targets where possible;
- scale estimates: writes/day, reads/day, retention;
- constraints and assumptions;
- 3–5 follow-up questions;
- common mistakes;
- license and attribution.

## Rubric

Use exactly seven dimensions:

1. Requirements clarification
2. Back-of-envelope estimation
3. API and data model
4. High-level architecture
5. Deep dives
6. Trade-offs
7. Communication

Make each level concrete:

- **1** = missing or incorrect
- **2** = partial, needs prompting
- **3** = solid, meets expectations
- **4** = strong, explains trade-offs and failure modes

Avoid vague levels such as "good" or "bad." Describe observable behavior.

## Reference design

The reference must include:

- a component diagram (`reference.excalidraw.json`);
- request and data flow;
- storage choices;
- scaling and failure handling;
- trade-offs and when the decision would change.

The reference is opinionated but should acknowledge reasonable alternatives.
Keep the drawing readable at the app's default canvas size.

## Review checklist

- [ ] Prompt is original and self-contained.
- [ ] Requirements are testable and prioritized.
- [ ] Scale numbers are plausible.
- [ ] Rubric has seven dimensions with concrete levels.
- [ ] Reference scene opens and is legible.
- [ ] Reference explains data flow, failure modes, and trade-offs.
- [ ] Follow-ups probe the hard parts, not trivia.
- [ ] License and attribution are present.

## Before opening a PR

```sh
pnpm content:validate
```

Then open the scenario in the app, draw a test attempt, save/reload it, and
compare it with the reference.
