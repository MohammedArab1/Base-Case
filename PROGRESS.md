# Progress Log

> Last updated: 2026-10-23
> Current phase: Phase 1 — Technical spike (macOS verified; Windows/clean-VM pending)
> Overall status: On track — macOS end-to-end verified; Windows packaging and clean-VM installs pending
> Next milestone: Windows artifacts + clean-VM verification, then Phase 2

This is the living status document for the project. `PLAN.md` describes the intended work; this file records what is actually done, what is in progress, what is blocked, and what comes next. Update it at the end of every work session and whenever a phase, section, or significant task is completed. See `PLAN.md` Section 0.1 for the full rules and template.

## Current status

| Area | Status | Last updated | Notes |
|---|---|---|---|
| Plan | Done | 2026-10-23 | `PLAN.md` v1.1; macOS + Windows scope; progress log required |
| Phase 0 — Decisions and project setup | In progress | 2026-10-23 | Code/docs complete. Pending: final name/trademark check; GitHub milestones/labels/board |
| Phase 1 — Technical spike | In progress | 2026-10-23 | macOS end to end verified and packaged; Windows packaging configured but not run; clean-VM installs pending |
| Phase 2 — App foundation | Not started | — | Shell, SQLite, content loader, design system |
| Phase 3 — Judge engine | Not started | — | Python + TypeScript adapters, sandbox, conformance |
| Phase 4 — Coding practice | Not started | — | Editor, run/submit, hints, FSRS |
| Phase 5 — System design | Not started | — | Canvas, notes, rubric, reference |
| Phase 6 — AI tutor | Not started | — | BYO provider, context builder, guardrails |
| Phase 7 — Content production | Not started | — | 10 coding + 4 design for alpha; one problem drafted in core |
| Phase 8 — Alpha release | Not started | — | Installers, docs, beta |
| Phase 9 — MVP expansion | Not started | — | 25 + 8 content, importer, polish |
| Phase 10 — v1.0 release | Not started | — | Stable release and community |

## Next up

1. Create the GitHub remote and run `ci.yml` and `build.yml` on macOS + Windows. Record the Windows artifact result.
2. Install the macOS DMG and the Windows build on clean VMs and record the result.
3. Decide the final name/domain and complete a basic trademark search. The code currently uses the provisional name “Base Case.”
4. Add milestones for Phases 0–10, labels, and a project board using `docs/project/github-setup.md`.
5. Start Phase 2: typed IPC envelopes, structured logging, design system, repository layer, FTS5, settings, and Playwright smoke tests.

## Blockers

- **Windows verification:** no Windows host or CI remote is available in this environment. The packaging workflow is written but has not run.
- **Clean-VM installs:** the macOS package was verified on the development machine, not a clean VM.
- **Name/trademark decision:** required before public branding or a domain purchase. Does not block Phase 2 engineering.
- **GitHub setup:** `gh` is not installed and this directory is not yet a GitHub remote. Milestones, labels, project board, and remote CI cannot be configured until the repository exists.

## Work log (newest first)

### 2026-10-23 — Phase 1 — Technical spike (macOS verified)

- Status: in progress (macOS complete; Windows packaging and clean-VM installs pending)
- Done:
  - Replaced the placeholder renderer with a real coding and design workspace:
    - Today/Review/Progress/Settings navigation, lazy-loaded Coding/Design/Settings views;
    - CodeMirror 6 Python/TypeScript editors with dark theme and SQLite autosave;
    - sanitized Markdown statements, progressive hints (level 4 requires confirmation), common mistakes, and follow-ups;
    - Run samples/Submit results with status, passed/total, runtime, first failure input/expected/actual, stderr, and per-test chips;
    - Excalidraw canvas with debounced scene autosave, restore, and PNG export through the main-process save dialog.
  - Implemented the real Go judge execution path:
    - generated Python and TypeScript harnesses; only test input reaches the child, expected output stays in the judge;
    - per-test temp workspace, sanitized environment, wall-clock timeout, 1 MiB output cap, process-group kill;
    - exact/unordered/float/set-of-sets checkers and the full status set used by the UI;
    - `doctor` runtime reporting and Windows cross-compilation of the judge.
  - Added Electron main services and typed preload IPC:
    - content repository with schema validation and JSONL test loading;
    - `node:sqlite` database with migration 1, attempts, drafts, design scenes, settings, AI provider config, WAL, and verified `VACUUM INTO` backups;
    - judge client with request IDs, timeouts, shutdown, and restart-on-next-request;
    - AI service with async `safeStorage`, context preview, mock provider, and OpenAI-compatible SSE streaming;
    - Zod validation for every IPC payload.
  - Added automation and packaging:
    - `scripts/build-judge.mjs` builds the correct binary name per platform;
    - `scripts/smoke-electron.mjs` drives the real app through CDP: content, sample/submit runs, wrong answer, drafts, scenes, mock AI, local OpenAI-compatible SSE, key storage, DB/backup, and UI navigation;
    - `scripts/measure-packaged.mjs` measures the packaged app;
    - `.github/workflows/build.yml` packages macOS and Windows artifacts;
    - `docs/install.md` documents unsigned install steps;
    - unsigned macOS arm64 DMG/ZIP built and verified with bundled content and judge.
  - Added `docs/spikes/phase-1-report.md` with measurements, gaps, demo script, and go/no-go.
  - Updated ADR-0004 (`node:sqlite` provisional), ADR-0010 (Phase 1 addendum), `PLAN.md` Phase 1 checkboxes, decisions D011/D013/D023, and open questions.
- Tests run (macOS arm64, Node 24.22.0, pnpm 12.15.0, Go 1.27.2, Electron 45.0.0):
  - `pnpm format:check` — passed.
  - `pnpm lint` — passed.
  - `pnpm typecheck` — passed for desktop, schema, and content-cli.
  - `pnpm test` — TypeScript tests and Go protocol/server/judge tests passed.
  - `pnpm judge:vet` — passed; `GOOS=windows GOARCH=amd64 go build ./...` and `go vet ./...` — passed.
  - `pnpm content:validate` — core pack valid.
  - `pnpm smoke:e2e` — passed: 5/5 sample accepted, 39/39 hidden accepted, wrong-answer path, drafts, scene persistence, mock AI stream, local OpenAI-compatible SSE stream, key storage, 3 attempts persisted, 1 verified backup, UI navigation.
  - `pnpm package:mac` — unsigned arm64 DMG (190 MB) and ZIP (190 MB) built; packaged app contains `content/` and `judge/judge`.
  - Packaged-app measurement: cold start 2,485 ms first / 451 ms warm; content load 13 ms / 1 ms; 5-test judge run 268 ms / 151 ms; idle memory 264.7 MB / 258.5 MB; app bundle 494.9 MB.
- Files/PRs:
  - No git commit or PR yet; all files are in the working tree.
  - Key new paths: `apps/desktop/src/main/*`, `apps/desktop/src/preload/index.ts`, `apps/desktop/src/shared/types.ts`, `apps/desktop/src/renderer/src/views/*`, `services/judge/internal/judge/*`, `scripts/*`, `docs/spikes/phase-1-report.md`, `docs/install.md`.
- Next:
  - Create the GitHub remote and run `ci.yml` + `build.yml` on macOS and Windows.
  - Install both artifacts on clean VMs and record the result.
  - Confirm the final name/trademark, then start Phase 2.
- Notes/decisions:
  - `node:sqlite` is adopted provisionally; it works in Electron 45 with no native rebuild.
  - System Python/Node and Node type stripping are spike-only. Production must bundle/transpile; ADR-0010 remains Proposed.
  - The spike sandbox is basic; Seatbelt/Job Objects, memory sampling, explicit in-flight cancellation, and esbuild/sucrase are Phase 3.
  - Windows packaging is configured but unverified; this is an environment/access blocker, not a design blocker.
  - Excalidraw adds large lazy chunks (Design view ~1.67 MB plus Mermaid chunks); keep the route-level split and revisit trimming in Phase 5.

### 2026-10-23 — Phase 0 — Project setup, skeleton, and first content

- Status: in progress (code/docs complete; two manual items pending)
- Done:
  - Read `PLAN.md` and `PROGRESS.md`; adopted the Phase 0 order of work.
  - Created the pnpm monorepo: `apps/desktop`, `services/judge`, `packages/schema`, `packages/content-cli`, `content`, `docs`, `.github`.
  - Added root tooling: pnpm workspaces (`pnpm@12.15.0`), TypeScript strict base config, ESLint flat config, Prettier, EditorConfig, `.gitattributes`, `.gitignore`, and root scripts.
  - Added a secure Electron + React placeholder shell:
    - `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`;
    - navigation blocked, external links opened in the system browser, permission requests denied;
    - narrow preload API with platform/version metadata only;
    - Today/Coding/System Design/Review/Progress/Settings navigation and accessible empty states;
    - per-mode CSP: strict `script-src 'self'` in production, inline scripts allowed only in the Vite dev server.
  - Added the Go judge protocol skeleton:
    - JSONL framing with a 1 MiB line cap;
    - `hello`, `version`, `ping`, `shutdown`;
    - structured `invalid_json`, `invalid_request`, and `unknown_method` errors;
    - `doctor` command and protocol/unit tests.
  - Added the content platform skeleton:
    - JSON schemas and TypeScript types for packs, problems, design scenarios, signatures, limits, checkers, hints, tests, and rubrics;
    - pack validation with duplicate-ID, referenced-file, path-traversal, JSONL, and quality checks;
    - `content validate` CLI;
    - problem and design templates.
  - Added the original `core/pair-sum` problem with 5 sample tests, 39 hidden tests, four hints, an explanation, and Python/TypeScript reference solutions. Test uniqueness was verified with an independent brute-force check.
  - Added governance and project docs:
    - MIT `LICENSE`, CC BY-SA 4.0 `CONTENT_LICENSE`, `NOTICE`;
    - ADRs 0001–0010 + template;
    - content policy, threat model, architecture overview, judge protocol draft;
    - problem/design authoring guides;
    - definition of done, code review checklist, wireframes, risk register, GitHub setup guide;
    - README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, CHANGELOG;
    - issue templates, PR template, Dependabot config, CI and judge workflows.
  - Updated `PLAN.md` Phase 0 checkboxes and decision/open-question status.
- Tests run (macOS arm64, Node 24.22.0, pnpm 12.15.0, Go 1.27.2):
  - `pnpm install` — succeeded; pnpm 12 `allowBuilds` configured for Electron/esbuild/electron-winstaller/fsevents.
  - `pnpm format:check` — passed.
  - `pnpm lint` — passed.
  - `pnpm typecheck` — passed for desktop, schema, and content-cli.
  - `pnpm test` — 4 TypeScript tests passed; Go protocol/server tests passed.
  - `pnpm content:validate` — core pack valid; no warnings.
  - `pnpm judge:vet` — passed.
  - `pnpm build` — Electron main/preload/renderer bundles built successfully; production CSP verified as `script-src 'self'`.
  - `pnpm judge:build` + manual JSONL session — `hello`, `ping`, and `shutdown` responses correct.
  - `pnpm dev` smoke launch — Vite dev server and Electron 45 started without errors; dev CSP includes the inline-script allowance for React refresh.
  - Independent Python brute-force check — every sample/hidden `pair-sum` test has exactly one valid pair after correcting one expected index.
- Files/PRs:
  - No git repository or PR yet; all files are in the working tree.
  - See the repository tree and `CHANGELOG.md` for the full list.
- Next:
  - Confirm the final name/domain and trademark status.
  - Create the GitHub repo, milestones, labels, and board.
  - Start Phase 1: measure Electron packaging, prove the Go judge for Python/TypeScript, persist a CodeMirror/Excalidraw state, and wire SQLite + AI.
- Notes/decisions:
  - D008 accepted: MIT for code, CC BY-SA 4.0 for content (ADR-0008).
  - D019 remains provisional: the working name is “Base Case” until the trademark/domain check.
  - D013 remains proposed: bundle Python/Node runtimes or download packs; decide from Phase 1 measurements.
  - Linux remains out of scope; no Linux CI, installers, runtimes, or sandbox paths were added.
  - The CI and judge workflows are configured for macOS and Windows, but have not run on GitHub yet because there is no remote.
  - `pair-sum` is original draft content, not part of the alpha content count yet.

### 2026-10-23 — Planning — Plan v1.1 and progress log

- Status: done
- Done:
  - Created the detailed build plan in `PLAN.md`.
  - Removed Linux from the initial release scope; macOS and Windows are the only targets for now.
  - Added the mandatory `PROGRESS.md` workflow and template.
  - Added decision D021 (macOS + Windows only) and D022 (maintain progress log).
- Tests run:
  - None (documentation only).
- Files/PRs:
  - `PLAN.md`
  - `PROGRESS.md`
- Next:
  - Start Phase 0.
- Notes/decisions:
  - Linux is explicitly deferred; do not add Linux CI, installers, runtime packs, or sandbox paths until it is reintroduced after v1.0.
  - Tick plan checkboxes as tasks complete, and record the same work here.

---

## How to add a new entry

Copy this block to the top of the work log and fill it in:

```md
### YYYY-MM-DD — Phase N — Short title

- Status: done / in progress / blocked
- Done:
  - ...
- Tests run:
  - ...
- Files/PRs:
  - ...
- Next:
  - ...
- Notes/decisions:
  - ...
```
