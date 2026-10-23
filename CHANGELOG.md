# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
semantic versioning once releases begin.

## [Unreleased]

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
  async `safeStorage` key encryption, and a local SSE test endpoint.
- Unsigned macOS arm64 DMG/ZIP packaging with bundled content and judge;
  macOS + Windows packaging workflow; unsigned install documentation.
- CDP smoke test and packaged-app measurement scripts.
- Phase 1 spike report with cold-start, memory, judge, and package measurements.
- Versioned Go judge JSONL protocol (`hello`, `version`, `doctor`, `ping`,
  `run`, `shutdown`) with tests.
- Content pack schema, TypeScript types, pack validation, and a `validate`
  CLI command.
- Bundled core pack with the original `pair-sum` problem, sample/hidden tests,
  hints, explanation, and Python/TypeScript reference solutions.
- Problem and design templates.
- ADRs 0001–0010, content policy, threat model, wireframes, definition of done,
  code review checklist, risk register, and GitHub setup guide.
- MIT code license, CC BY-SA 4.0 content license, NOTICE, contributing guide,
  code of conduct, and security policy.
- Initial CI, build workflow, Dependabot, issue templates, and PR template.

### Changed

- None yet.

### Fixed

- None yet.

### Security

- Renderer runs with `contextIsolation: true`, `nodeIntegration: false`, and
  `sandbox: true`.
- Navigation is blocked; external links open in the system browser.
