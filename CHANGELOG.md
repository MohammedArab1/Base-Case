# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
semantic versioning once releases begin.

## [Unreleased]

### Added

- Offline **Learn** library with 39 lessons covering Big O, core data
  structures, algorithms, and system-design fundamentals. Each lesson includes
  beginner-friendly explanations, ASCII diagrams, worked examples, a complexity
  cheatsheet, interview notes, common mistakes, self-check questions, and linked
  coding or design practice.
- Local lesson completion and recency tracking in SQLite, included in user-data
  export/import.
- Optional lesson clarification through the existing AI provider abstraction,
  with a context preview and per-feature toggle. AI remains off by default.
- Two original exercises: **Prefix Ledger** (tries) and **Window Max** (deques).
  The core pack now has 81 coding problems and 162 reference solutions.
- Expanded the system-design track from 8 to 17 lessons, covering the core topic
  index of the public System Design Primer: performance and scalability,
  latency and throughput, availability and failover, DNS, reverse proxies,
  application architecture, NoSQL and storage selection, network protocols,
  security, estimation references, and real-world architecture patterns. All
  explanations, diagrams, and examples are original to Base Case.
- Lesson authoring guide and ADR-0012.

### Changed

- The core pack now has 39 lessons listed in `pack.json`. Pack import validates
  lesson prerequisite and exercise references.
- The golden-pack content counts are now 81 coding problems, 8 design scenarios,
  39 lessons, and a 75-problem Grind 75 collection.

### Fixed

- Nothing yet.

## [0.1.0-alpha] — 2026-10-25

### Added

- Phase 0 monorepo skeleton: `apps/desktop`, `services/judge`,
  `packages/schema`, `packages/content-cli`, `content`, `docs`.
- Secure Electron + React shell with a real coding workspace, Markdown
  statements, CodeMirror editors, progressive hints, structured results, and a
  Settings view.
- Go judge execution for Python and TypeScript function signatures:
  generated harnesses, temp workspaces, sanitized environment, wall-clock and
  output limits, process-group kill, checkers, and runtime diagnostics.
- SQLite (`node:sqlite`) migration, attempts, drafts, design scenes, settings,
  AI provider config, WAL, and verified startup backups.
- Excalidraw canvas with local scene persistence and PNG export.
- Optional AI: context preview, mock provider, OpenAI-compatible streaming,
  async `safeStorage` key encryption, a local SSE test endpoint, per-feature
  toggles, guardrails, design-note review, a follow-up interviewer, and a local
  bug-zoo eval harness. AI is off by default.
- Ten original coding problems across the alpha patterns, each with sample and
  hidden tests, four hints, an explanation, common mistakes, follow-ups, and
  Python/TypeScript reference solutions.
- Four system design scenarios with prompts, requirements, scale targets,
  seven-dimension rubrics, reference designs, expected-topic checklists, and
  Markdown/PNG export.
- FSRS review queue, mistake tags, Today and Progress dashboards, and JSON data
  export/import.
- Content pack import (ZIP or folder) with schema validation, preview, an
  Unverified badge, and removal that preserves attempts.
- Content CLI `test` command that runs every reference solution against sample
  and hidden tests through the real judge.
- Diagnostics self-test in Settings covering the database, storage, logs,
  content, search index, judge, runtimes, and AI configuration, with a copyable
  report. Nothing is sent over the network.
- Unsigned macOS arm64 DMG/ZIP packaging with bundled content and judge;
  macOS + Windows packaging workflow; unsigned install documentation.
- SHA-256 checksum generation and a tag-driven GitHub Release job.
- CDP smoke test and packaged-app measurement scripts.
- Phase 1 spike report with cold-start, memory, judge, and package measurements.
- Versioned Go judge JSONL protocol (`hello`, `version`, `doctor`, `ping`,
  `run`, `shutdown`) with tests.
- Content pack schema, TypeScript types, pack validation, and a `validate`
  CLI command.
- Problem and design templates.
- Quickstart and two-minute tutorial, FAQ, privacy and AI notes, known
  limitations, and the alpha release runbook.
- Alpha feedback issue form.
- ADRs 0001–0011, content policy, threat model, wireframes, definition of done,
  code review checklist, risk register, GitHub setup guide, and the canonical
  open-blockers list.
- MIT code license, CC BY-SA 4.0 content license, NOTICE, contributing guide,
  code of conduct, and security policy.
- Initial CI, build workflow, Dependabot, issue templates, and PR template.

### Changed

- Version bumped to `0.1.0-alpha` and the release tag is `v0.1.0-alpha`.

### Fixed

- None yet.

### Security

- Renderer runs with `contextIsolation: true`, `nodeIntegration: false`, and
  `sandbox: true`.
- Navigation is blocked; external links open in the system browser.
- API keys are encrypted with `safeStorage` and excluded from exports and the
  diagnostics report.
