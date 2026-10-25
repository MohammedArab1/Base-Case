# Progress Log

> Last updated: 2026-10-25
> Current phase: Phase 5 — System design (core loop complete; three more scenarios remain)
> Overall status: On track — coding and design practice both run end to end with local persistence, FSRS review, and Markdown/PNG export
> Next milestone: Add the remaining Phase 5 scenarios, then Phase 6 AI tutor

This is the living status document for the project. `PLAN.md` describes the intended work; this file records what is actually done, what is in progress, what is blocked, and what comes next. Update it at the end of every work session and whenever a phase, section, or significant task is completed. See `PLAN.md` Section 0.1 for the full rules and template.

## Current status

| Area | Status | Last updated | Notes |
|---|---|---|---|
| Plan | Done | 2026-10-23 | `PLAN.md` v1.1; macOS + Windows scope; progress log required |
| Phase 0 — Decisions and project setup | In progress | 2026-10-23 | Code/docs complete; name confirmed as “Base Case.” Pending: trademark search before public launch; GitHub milestones/labels/board |
| Phase 1 — Technical spike | In progress | 2026-10-23 | macOS and Windows verified end to end; only clean-VM installs remain |
| Phase 2 — App foundation | Done | 2026-10-24 | All Phase 2 tasks complete: shell, IPC, logging, settings, search, packs, onboarding, repositories, inspector, and Playwright |
| Phase 3 — Judge engine | Done | 2026-10-24 | Protocol, memory, compile-once, harness, sandbox, conformance, and runtime bundling complete. Design signatures are deferred to Phase 5. Packaged macOS app: 252 MB DMG, ~2.4 s cold start, bundled runtimes |
| Phase 4 — Coding practice | Done | 2026-10-24 | All Phase 4 tasks complete: practice loop, hints, snapshots, mistake tags, FSRS review, filters, cancellation, KaTeX, export/import, and Playwright coverage. Windows E2E is confirmed by CI |
| Phase 5 — System design | In progress | 2026-10-25 | Scenario loader, themed canvas, structured notes, seven-dimension rubric, reference reveal, attempt history, design FSRS cards, and Markdown+PNG export are complete; three more scenarios and a native-dialog export test remain |
| Phase 6 — AI tutor | In progress | 2026-10-24 | Mock + OpenAI-compatible streaming, encrypted key, context preview, and redaction exist; guardrails/evals and history remain |
| Phase 7 — Content production | Not started | — | 10 coding + 4 design for alpha; one problem drafted in core |
| Phase 8 — Alpha release | Not started | — | Installers, docs, beta |
| Phase 9 — MVP expansion | Not started | — | 25 + 8 content, importer, polish |
| Phase 10 — v1.0 release | Not started | — | Stable release and community |

## Next up

1. Add the three remaining Phase 5 design scenarios and reference scenes.
2. Add an automated check for the native export dialog, then start Phase 6 AI tutor work.
3. Confirm the Windows Playwright run in CI.
4. Install the rebuilt Windows build and the macOS DMG on clean VMs and record the result.
3. Install the rebuilt Windows build and the macOS DMG on clean VMs and record the result.
4. Re-run the uninstall row of the full Windows checklist on a fresh install.
5. Do a basic trademark search for “Base Case” before public launch (the name is confirmed). Register the domain when branding starts.
6. Add milestones for Phases 0–10, labels, and a project board using `docs/project/github-setup.md`.

## Blockers

- **Clean-VM installs:** no clean macOS or Windows VM is available in this environment. The Windows build was verified on a physical Windows 11 machine and macOS on the development machine.
- **Name/trademark:** the name is confirmed as “Base Case.” A basic trademark search and domain registration remain before public branding; neither blocks engineering.
- **GitHub setup:** `gh` is not installed. Milestones, labels, and the project board still need to be created through the web UI or a token-based script.

## Work log (newest first)

### 2026-10-25 — Phase 5 — Design practice loop

- Status: Phase 5 core loop complete (scenario content expansion remains)
- Done:
  - Added `checklist` to the design scenario schema and loader; `ContentRepository` now loads `designs/` and exposes scenario summaries and details.
  - Added the original `core/url-shortener` scenario with a seven-dimension rubric, reference design, expected-topics checklist, follow-ups, and common mistakes.
  - Added `DesignRepository` drafts, submissions, attempt history, and a pure Markdown exporter, with IPC and preload coverage.
  - Rebuilt the System Design view: scenario list, theme-aware Excalidraw canvas, seven structured note sections, rubric self-assessment with required evidence, reference reveal, score summary, attempt history, and Markdown+PNG export.
  - Design submissions create an FSRS card for manual grading in Review.
  - Added repository and exporter tests, a 150-element scene round-trip test, and a Playwright draw → notes → rubric → submit → reference → restart flow.
- Tests run:
  - `pnpm format:check`, `pnpm lint`, `pnpm typecheck` — passed.
  - `pnpm test` — 65 tests passed across 18 files.
  - `pnpm content:validate` — passed with one warning (no reference Excalidraw scene).
  - `pnpm build`, `pnpm smoke:e2e` — passed (design scenario, draft, submit, and review card).
  - `pnpm --filter @base-case/desktop test:e2e` — 3 passed.
- Files/PRs:
  - Key paths: `apps/desktop/src/main/content.ts`, `repositories/design.ts`, `design-export.ts`, `renderer/src/views/DesignView.tsx`, `content/packs/core/designs/url-shortener/`.
- Next:
  - Add three more design scenarios and optional reference scenes; add a native export-dialog check; then Phase 6 AI tutor.
- Notes/decisions:
  - Design drafts reuse `design_attempts` with the deterministic id `draft:<scenarioId>` and status `draft`; submitted attempts are immutable snapshots.
  - The reference is revealed only after a submission, and design cards are graded manually so the learner can reflect before scheduling.

### 2026-10-24 — Phase 4 — KaTeX and editor polish

- Status: Phase 4 complete (all tasks checked; Windows E2E runs in CI)
- Done:
  - Markdown now renders inline and block math with KaTeX behind a tightened sanitize schema; raw HTML from content packs is still stripped.
  - CodeMirror highlights the failing line reported by the judge.
  - Added Copy and Reset controls to the editor toolbar.
  - Added a renderer Markdown test covering KaTeX output and sanitization.
- Tests run:
  - `pnpm format:check`, `pnpm lint`, `pnpm typecheck` — passed.
  - `pnpm test` — 58 tests passed across 16 files.
  - `pnpm build`, `pnpm smoke:e2e` — passed.
  - `pnpm --filter @base-case/desktop test:e2e` — 2 passed.
- Files/PRs:
  - Key paths: `apps/desktop/src/renderer/src/components/Markdown.tsx`, `CodeEditor.tsx`, `CodingView.tsx`, `apps/desktop/vitest.config.mts`.
- Next:
  - Phase 5 design module.
- Notes/decisions:
  - KaTeX runs after sanitization so the generated presentation markup survives, while the source Markdown is still sanitized.

### 2026-10-24 — Phase 4 — filters, cancel, and data transfer

- Status: Phase 4 in progress (exit criteria met; KaTeX and editor polish remain)
- Done:
  - Added problem-library filters for difficulty, pattern, status, and review-due, with per-problem Accepted and Review-due badges.
  - Streamed judge `test_result` events into the results panel and added a Cancel button; cancelled runs are stored as attempts but do not update review cards.
  - Added JSON user-data export/import covering settings, attempts, attempt events, mistake tags, review cards/logs, drafts, notes, design data, and AI provider configuration. API keys are excluded, and imports validate the bundle format before a transactional merge.
  - Added Settings controls for backup and transfer.
  - Extended the judge smoke test with cancellation and the data round-trip, and Playwright with filter coverage.
- Tests run:
  - `pnpm format:check`, `pnpm lint`, `pnpm typecheck` — passed.
  - `pnpm test` — 56 tests passed across 15 files.
  - `pnpm content:validate` — passed.
  - `pnpm build`, `pnpm smoke:e2e` — passed (including cancel).
  - `pnpm --filter @base-case/desktop test:e2e` — 2 passed.
- Files/PRs:
  - Key paths: `apps/desktop/src/main/repositories/user-data.ts`, `apps/desktop/src/main/ipc.ts`, `apps/desktop/src/renderer/src/views/CodingView.tsx`, `SettingsView.tsx`, `scripts/smoke-electron.mjs`.
- Next:
  - KaTeX rendering and editor error-line highlighting; confirm Windows Playwright in CI.
- Notes/decisions:
  - Export excludes `ai_provider_configs.key_ref` because the keychain entry is machine-local.
  - Import uses `INSERT OR REPLACE` per table in dependency order, filtered through `PRAGMA table_info`, inside one transaction.

### 2026-10-24 — Phase 4 — FSRS review slice

- Status: Phase 4 in progress (review slice complete)
- Done:
  - Added migration 5: `learning_steps` for ts-fsrs, attempt snapshot columns (`plan`, `hints_used`, `solution_viewed`), draft plans, and `review_logs`.
  - Added `ReviewRepository` on ts-fsrs 5.4.2: the first submission creates a new card, later submissions derive a grade (clean accept → Easy, hints → Good, level-4 hint or solution → Hard, failures → Again), manual grades, queue ordering, due/new daily limits, previews, and review logs.
  - Added `MistakesRepository` with an eight-tag seed taxonomy, idempotent retagging, and counts.
  - Added IPC and preload APIs for review queue/preview/grade, mistakes, attempt detail/recent/tag, draft plans, and Today/Progress summaries.
  - Added a review queue UI, review mode that hides hints/solutions/follow-ups, in-workspace grade buttons with next-due previews, a plan field, snapshot restore, and mistake tagging in the Inspector.
  - Replaced the Today and Progress stubs with live dashboards (due/new counts, streak, pattern coverage, mistake counts, recent attempts).
  - Added review settings (reviews per day, new cards per day).
  - Extended the unit suite (review transitions/limits, rating table, mistake tagging/rollback) and Playwright (solve → submit → review → grade → tag).
- Tests run:
  - `pnpm format:check`, `pnpm lint`, `pnpm typecheck` — passed.
  - `pnpm test` — 58 tests passed across 14 files.
  - `pnpm content:validate` — passed.
  - `pnpm build`, `pnpm smoke:e2e` — passed.
  - `pnpm --filter @base-case/desktop test:e2e` — 2 passed.
- Files/PRs:
  - Key paths: `apps/desktop/src/main/repositories/review.ts`, `mistakes.ts`, `apps/desktop/src/renderer/src/views/ReviewView.tsx`, `TodayView.tsx`, `ProgressView.tsx`, `CodingView.tsx`, `Inspector.tsx`, `apps/desktop/src/main/migrations.ts`.
- Next:
  - Phase 4 remainder: problem filters, cancel UI, export/import, and KaTeX/error-line polish.
- Notes/decisions:
  - The first submission creates a new card instead of grading it immediately, so the first review happens in the queue rather than days later.
  - Review-mode attempts are never auto-graded; the learner grades explicitly, which prevents a single session from updating the card twice.

### 2026-10-24 — Phase 3 — P3-F runtime bundling

- Status: Phase 3 complete (ADR-0010 accepted)
- Done:
  - Added `runtimes.json` with pinned Python 3.12.15 and Node 24.22.0 URLs, SHA-256 checksums, sizes, license paths, and strip rules for macOS arm64 and Windows x64.
  - Added `scripts/fetch-runtimes.mjs`: cached download, checksum verification, extraction, Python/Node slimming, license copying, `manifest.json`, `--verify`, and `--force` repair.
  - Added bundled runtime discovery to the judge (`BASE_CASE_RUNTIME_ROOT`, `Resources/runtimes`, `build/runtime`) and a `source` field (`env`/`bundled`/`system`) in `doctor`.
  - Included `build/runtime` in `electron-builder` and wired `package:mac`/`package:win` to fetch runtimes first.
  - Updated Settings to show the runtime source and describe bundled runtimes.
  - Packaged and measured the macOS app: 252.0 MB DMG, 252.6 MB ZIP, 690.6 MB app bundle, 2374 ms cold start, 246 ms for 5 judge tests, both runtimes reported as `bundled`.
  - Accepted ADR-0010 and updated the decision log, plan, install docs, and progress log.
- Tests run:
  - `pnpm runtimes:fetch` and `pnpm runtimes:verify` — passed.
  - Judge tests with `BASE_CASE_RUNTIME_ROOT=build/runtime` — passed (Python, TypeScript, sandbox).
  - `BASE_CASE_RUNTIME_ROOT=build/runtime pnpm smoke:e2e` — passed.
  - `CSC_IDENTITY_AUTO_DISCOVERY=false pnpm package:mac` — passed.
  - `node scripts/measure-packaged.mjs` — bundled runtimes, 252.0 MB DMG, 2374 ms cold start.
- Files/PRs:
  - Key paths: `runtimes.json`, `scripts/fetch-runtimes.mjs`, `services/judge/internal/judge/runtimes.go`, `apps/desktop/electron-builder.yml`, `apps/desktop/src/renderer/src/views/SettingsView.tsx`, `docs/adr/0010-runtime-bundling.md`.
- Next:
  - Phase 4 review work.
- Notes/decisions:
  - The slim layout ships the Node binary only (no npm/corepack/headers) and strips Python headers, pip, idlelib, tkinter, and test data.
  - Windows packaging remains in the `Build installers` workflow; the projected installer is ~255 MiB.

### 2026-10-24 — Phase 3 — P3-F runtime measurement

- Status: P3-F measurement complete; packaging waits on the ADR-0010 decision
- Done:
  - Downloaded pinned Python 3.12.15 (`python-build-standalone`) and Node 24.22.0 packs for macOS arm64 and Windows x64.
  - Measured compressed pack sizes: macOS 25.2 MB + 53.0 MB = 78.2 MB; Windows 46.4 MB + 37.7 MB = 84.1 MB.
  - Measured the existing package: 190.6 MB DMG/ZIP, 482.5 MB app bundle, 2652 ms cold start, 220 ms for 5 judge tests.
  - Projected installers of ~269 MB (macOS) and ~255 MiB (Windows), under the 350 MB budget. The judge is spawned lazily, so bundling does not affect cold start.
  - Ran the judge against the pinned packs: first Python run 0.43 s, first Node run 1.71 s, later tests 50–80 ms.
  - Recorded the data and recommendation in ADR-0010.
- Tests run:
  - `node scripts/measure-packaged.mjs` — passed.
  - Judge codec tests with `BASE_CASE_PYTHON`/`BASE_CASE_NODE` pointed at the pinned packs — passed.
- Files/PRs:
  - Key paths: `docs/adr/0010-runtime-bundling.md`, `PROGRESS.md`, `scripts/smoke-electron.mjs` (Windows cleanup retries).
- Next:
  - Maintainer decision on ADR-0010. If accepted, implement P3-F (fetch script, `runtimes.json`, licenses, repair, packaged measurement). If declined, move to Phase 4 review.
- Notes/decisions:
  - Node's npm/corepack/headers/docs are unnecessary for the judge; shipping only the `node` binary keeps the extracted footprint down.

### 2026-10-24 — Phase 3 — P3-G conformance and CI E2E

- Status: Phase 3 in progress (P3-G complete; P3-F blocked on the runtime decision)
- Done:
  - Added the remaining conformance cases: runtime error, JavaScript accepted, float tolerance, and set-of-sets at the runner level.
  - The Go suite now covers every user-facing status except design-specific paths: accepted, wrong answer, compile error, runtime error, time limit, memory limit, output limit, internal start failure, and cancellation.
  - Added the app-level judge E2E (`pnpm smoke:e2e`) to the macOS and Windows CI matrix, with Go and Python set up in the Node job.
  - Recorded the conformance scope in `PLAN.md`; content problems remain Phase 7 work.
- Tests run:
  - Targeted conformance tests — passed.
  - `go test -C services/judge -race ./...` — passed.
  - `GOOS=windows GOARCH=amd64 go build -C services/judge ./...` — passed.
- Files/PRs:
  - Key paths: `services/judge/internal/judge/runner_test.go`, `.github/workflows/ci.yml`, `PLAN.md`.
- Next:
  - P3-F: measure pinned Python/Node runtimes, then accept or supersede ADR-0010.
- Notes/decisions:
  - CI now runs the judge inside the real Electron app on both supported platforms, not just the Go suites.
  - Design fixtures are intentionally deferred to Phase 5.

### 2026-10-24 — Phase 3 — P3-E sandbox hardening

- Status: Phase 3 in progress (P3-E complete)
- Done:
  - Wrapped macOS runtime invocations in a Seatbelt profile that denies network and home access, limits process execution to the resolved runtime prefix, allows system/runtime reads, and restricts writes to the workspace and temp directories.
  - Added a warning fallback when `sandbox-exec` is unavailable.
  - Extended the Windows Job Object with job memory (25% headroom over the sampler threshold), total user-time (2× wall clock), and 64-process active limits, alongside kill-on-close.
  - Refactored the sampler to collect process count as well as memory and to kill the group at 64 processes.
  - Added macOS security tests for network denial, home read denial, home write denial, process-exec denial, and the process-count limit. The home-write test also verifies no file was created.
  - Documented the implementation in ADR-0009, the threat model, the README, and the protocol/authoring docs.
- Tests run:
  - `go test -C services/judge -race ./...` — passed (including 5 macOS sandbox security tests).
  - `GOOS=windows GOARCH=amd64 go build -C services/judge ./...` — passed.
- Files/PRs:
  - Key paths: `services/judge/internal/judge/sandbox_darwin.go`, `sandbox_other.go`, `sandbox_test.go`, `process_unix.go`, `process_windows.go`, `runner.go`, `docs/adr/0009-sandbox.md`, `docs/architecture/threat-model.md`.
- Next:
  - P3-F: measure pinned Python/Node runtime packs, accept or supersede ADR-0010, then add checksums, licenses, and repair.
- Notes/decisions:
  - `sandbox-exec` remains the practical non-App-Store macOS control; the profile is re-tested by the Go suite on macOS.
  - Windows filesystem and network isolation remain best-effort; imported content is not safely isolated on Windows.

### 2026-10-24 — Phase 3 — P3-D harness coverage

- Status: Phase 3 in progress (P3-D complete; design harness deferred to Phase 5)
- Done:
  - Added shared Python and TypeScript codecs for `ListNode` and `TreeNode`. Lists cross as arrays; trees use level-order arrays with `null` placeholders and trailing-null trimming.
  - Injected `ListNode`/`TreeNode` into the Python solution module so annotations resolve, and installed them on `globalThis` before the TypeScript import.
  - Implemented in-place mutation capture: the harness now records every parameter listed in `mutates` after the call instead of emitting `mutated: {}`.
  - Added judge-side signature validation for supported parameter/return types, duplicate parameters, and unknown or duplicate `mutates` entries.
  - Added Python and TypeScript tests for linked lists, trees (including empty trees), in-place arrays, in-place node mutation, Unicode/empty strings, and a 20,000-element input.
  - Updated the authoring guide and protocol document with node encoding and in-place result shapes.
- Tests run:
  - `go test -C services/judge -race ./...` — passed.
  - `GOOS=windows GOARCH=amd64 go build -C services/judge ./...` — passed.
- Files/PRs:
  - Key paths: `services/judge/internal/judge/harness.go`, `runner.go`, `runner_test.go`, `docs/authoring/problem-authoring.md`, `docs/architecture/judge-protocol.md`.
- Next:
  - P3-E: macOS Seatbelt profile, Windows job memory/CPU limits, and automated network/home-write/fork-bomb fixtures.
- Notes/decisions:
  - The design harness stays with Phase 5; the coding alpha only needs function and in-place signatures.
  - Node values are duck-typed across the harness boundary (`.val`/`.next`/`.left`/`.right`), so authors should not use `instanceof`.

### 2026-10-24 — Phase 3 — P3-C compile/transpile once

- Status: Phase 3 in progress (P3-C complete)
- Done:
  - Added a compile phase that runs once per run, before any test process starts.
  - Python: `python -I -m py_compile solution.py` validates syntax once.
  - TypeScript: `esbuild`'s Go API transpiles `solution.ts` to `solution.mjs` with an inline source map. Node no longer receives `--experimental-strip-types`; it runs plain ESM with `--enable-source-maps`.
  - JavaScript: `node --check solution.mjs` validates syntax once; the file is written as ESM.
  - Compile failures now return `compile_error` with `compile.ok=false`, compiler output, zero tests run, and a first-failure entry for the UI.
  - Added tests for Python, TypeScript, and JavaScript compile errors, plus a TypeScript `enum` fixture that Node type stripping could not run.
- Tests run:
  - `go test -C services/judge ./...` and `go test -C services/judge -race ./...` — passed.
  - `GOOS=windows GOARCH=amd64 go build -C services/judge ./...` — passed.
  - Targeted compile tests — passed.
- Files/PRs:
  - Key paths: `services/judge/internal/judge/compile.go`, `runner.go`, `harness.go`, `runner_test.go`, `services/judge/go.mod`, `PLAN.md` (D024).
- Next:
  - P3-D: in-place mutation capture and ListNode/TreeNode codecs; keep the design harness with Phase 5.
- Notes/decisions:
  - The judge binary grows from ~4 MB to ~12 MB with esbuild, which is acceptable against the app budget and avoids shipping a separate transpiler.
  - Compilation has its own 10 s limit and is separate from per-test execution time.

### 2026-10-24 — Phase 3 — P3-B memory enforcement

- Status: Phase 3 in progress (P3-B complete)
- Done:
  - Added a process-tree memory sampler that runs every 100 ms while a test executes. On macOS it sums the runtime process group via `ps`; on other Unix systems it walks the process tree; on Windows it walks Toolhelp snapshots and sums `GetProcessMemoryInfo` working sets.
  - Added a hard kill on limit breach with `memory_limit_exceeded` and a clear message.
  - Added post-exit enforcement using the kernel high-water mark (`getrusage` on Unix, Job Object peak on Windows), so a fast allocation that finishes between samples is still reported as MLE.
  - Populated `memoryBytes` on every test result and `peakMemoryBytes` on the run summary.
  - Added tests for sampled MLE, post-exit MLE, and peak reporting on accepted Python and TypeScript runs.
- Tests run:
  - `go test -C services/judge -race ./...` — passed.
  - `GOOS=windows GOARCH=amd64 go build -C services/judge ./...` — passed.
  - Targeted memory tests — passed (`TestMemoryLimitExceeded` 0.15s, `TestMemoryLimitExceededAfterExit` 0.07s).
- Files/PRs:
  - Key paths: `services/judge/internal/judge/process_unix.go`, `process_windows.go`, `runner.go`, `runner_test.go`, `docs/architecture/judge-protocol.md`.
- Next:
  - P3-C compile/transpile once: pin an esbuild or sucrase step, compile Python once, and run plain JavaScript per test.
- Notes/decisions:
  - The sampler adds one `ps` call per 100 ms on macOS; fast tests finish before the first tick and rely on the post-exit high-water mark.
  - Windows Job Object memory/CPU limits remain a P3-E hardening item; P3-B enforcement is sampler-based on both platforms.

### 2026-10-24 — Phase 3 — P3-A protocol completion

- Status: Phase 3 in progress (P3-A complete)
- Done:
  - Reworked the Go server to read requests continuously while runs execute in goroutines. All output is serialized through one encoder, so responses and events from concurrent requests cannot interleave mid-line.
  - Added `cancel` with `{"targetId": "..."}`. It cancels the run context, kills the process group, returns `{"cancelled": true}`, and the run still receives a final `cancelled` result. Late cancels return `false` instead of erroring.
  - Added `test_result` streaming events from the runner (`RunWithEvents`) and the server. Events share the run id but never complete the request.
  - Added `duplicate_request_id` rejection, `invalid_params` handling, and shutdown that cancels active runs and waits briefly before replying.
  - Added a host protocol-version guard: `JudgeClient` performs `hello` once per sidecar, rejects unknown versions with `protocol_version_mismatch`, and ignores event lines when matching pending requests.
  - Added `JudgeClient.cancel(requestId)` and per-run `requestId`/`onEvent` options. The IPC/renderer cancel button is intentionally deferred to Phase 4.
  - Updated `docs/architecture/judge-protocol.md` with concurrency, cancel, event, and shutdown semantics.
- Tests run:
  - `go test -C services/judge ./...` and `go test -C services/judge -race ./...` — passed.
  - `pnpm test` — 44 desktop TypeScript tests + 4 schema tests + the Go suites passed.
  - `pnpm typecheck` — passed.
- Files/PRs:
  - Key paths: `services/judge/internal/server/server.go`, `services/judge/internal/protocol/protocol.go`, `services/judge/internal/judge/runner.go`, `apps/desktop/src/main/judge.ts`, `docs/architecture/judge-protocol.md`.
- Next:
  - P3-B memory enforcement: process-tree sampling every 50–100 ms, hard kill, `memory_limit_exceeded`, and peak memory in every result.
- Notes/decisions:
  - Protocol version stays at 1; events and `cancel` are additive.
  - Cancellation is context-based end to end: server run context → `runTest` context → process-group kill.

### 2026-10-24 — Phase 3 — Judge gap analysis

- Status: Phase 3 in progress (analysis complete; implementation not started)
- Done:
  - Audited the protocol, server, runner, harnesses, runtime discovery, process control, tests, and Electron client against the Phase 3 checklist.
  - Confirmed working: protocol v1 with request IDs and shutdown, `doctor`/system runtime discovery, Python and TypeScript function harnesses, four checkers, time/output limits, process-group kill, Windows kill-on-close Job Objects, environment sanitization, the macOS/Windows Go CI matrix, and the end-to-end app loop.
  - Found the blocking gaps: no memory enforcement or `memory_limit_exceeded`, no in-flight cancellation or streaming events, no host protocol-version guard, no compile/transpile-once path, function-only harnesses (`mutates` is plumbed but unused; no ListNode/TreeNode/design), no macOS Seatbelt, no Windows memory/CPU job limits, no runtime bundling/checksums/repair, thin conformance fixtures, and no automated sandbox security tests.
  - Wrote `docs/spikes/phase-3-gap-analysis.md` with a task scorecard, exit-criteria assessment, decisions needed, evidence index, and seven ordered work packages.
  - Restructured the Phase 3 checklist in `PLAN.md` to record partial progress accurately instead of treating the phase as unstarted.
- Tests run:
  - `go test -C services/judge ./...` — passed (28 test functions; 26 cross-platform). No code changed in this step.
- Files/PRs:
  - Key paths: `docs/spikes/phase-3-gap-analysis.md`, `PLAN.md`, `PROGRESS.md`.
- Next:
  - P3-A protocol completion and P3-B memory enforcement; then P3-C transpile-once. Measure runtime packs for ADR-0010 in parallel.
- Notes/decisions:
  - Protocol v1 can be extended additively with events and cancellation; avoid a version bump unless a breaking change appears.
  - Recommendation: implement function, in-place, ListNode, and TreeNode harness coverage now, and move the design harness to Phase 5 so it does not block the coding alpha.
  - Runtime bundling remains the one decision that needs maintainer input before packaging work begins.

### 2026-10-24 — Phase 2 — Coding inspector, notes, and attempt history

- Status: Phase 2 complete
- Done:
  - Added a responsive inspector to the coding workspace with AI, Notes, and History tabs. It is inline above 1480px and stacks below the panes on narrower windows; the open state and width are remembered in localStorage, with a pointer and keyboard resize handle.
  - Moved the AI streaming panel into the inspector while keeping the existing context-preview modal. Opening or sending AI automatically reveals the inspector.
  - Added per-problem notes in migration 4 (`problem_notes`), a `ProblemNotesRepository`, notes IPC/preload methods, debounced autosave, save-on-blur, and a flush when the tab or workspace unmounts.
  - Added `attempts.list(problemId)` with newest-first attempt history and rendered it in the inspector.
  - Extended `smoke:e2e` with notes and attempt-history assertions, and the Playwright test with inspector toggling, notes persistence across relaunch, and the empty history state. Added optional `BASE_CASE_PLAYWRIGHT_SCREENSHOTS` capture and checked the stacked (1280px) and inline (1600px) layouts.
- Tests run:
  - `pnpm format:check`, `pnpm lint`, `pnpm typecheck` — passed.
  - `pnpm test` — 38 desktop TypeScript tests + 4 schema tests + the Go suites passed.
  - `pnpm build && pnpm smoke:e2e` — passed with `attemptHistory: true` and `notes: true`.
  - `pnpm smoke:playwright` — passed; notes survive a relaunch.
- Files/PRs:
  - Key paths: `renderer/src/components/Inspector.tsx`, `renderer/src/views/CodingView.tsx`, `renderer/src/workspace.css`, `main/repositories/notes.ts`, `main/migrations.ts`, `shared/types.ts`, `shared/ipc.ts`, `main/ipc.ts`, `preload/index.ts`, `e2e/app.spec.ts`, `scripts/smoke-electron.mjs`, `docs/adr/0011-sqlite-scope.md`.
- Next:
  - Phase 3 gap analysis and judge hardening; clean-VM installs still need hardware.
- Notes/decisions:
  - Notes are SQLite-backed, not localStorage; only cosmetic layout state uses localStorage.
  - The inspector stacks below 1480px because the statement/editor minimum widths do not fit with a useful right rail at the default 1280px window. The wide layout remains the intended three-column design.
  - All Phase 2 checklist items are now checked. Phase 3–6 statuses were corrected to “in progress” because the Phase 1 spike already shipped partial functionality; the remaining checklist gaps are listed in the status table.

### 2026-10-24 — Phase 2 — Repository split and schema scope

- Status: in progress (structural database work done; app-layout inspector remains)
- Done:
  - Split the old `AppDatabase` into a connection/migration/backup owner plus focused repositories: `ContentIndexRepository`, `SettingsRepository`, `AttemptsRepository`, `DraftsRepository`, `DesignRepository`, and `AiProviderRepository`.
  - Updated `SettingsStore`, `AiService`, `PackManager`, the IPC handlers, and startup wiring to depend on repositories. The IPC layer no longer receives the raw SQLite handle; it receives narrow repositories plus the database path for diagnostics.
  - Added ADR-0011: pack content stays file-backed and SQLite holds user state plus the FTS index. The Section 4.3 content mirror tables are intentionally deferred; a rebuildable derived table is the preferred future option if SQL access is needed.
  - Added migration 3 with `attempt_events`, `mistake_tags`, `attempt_mistake_tags`, `review_cards`, and `design_attempts`. The existing `schema_migrations` history table records it.
  - Added a migration test that upgrades a version-2 database and preserves settings, plus repository tests for attempts/stats, drafts, design scenes, content search, and AI provider metadata.
- Tests run:
  - `pnpm format:check`, `pnpm lint`, `pnpm typecheck` — passed.
  - `pnpm test` — 35 desktop TypeScript tests + 4 schema tests + the Go suites passed.
  - `pnpm build && pnpm smoke:e2e && pnpm smoke:playwright` — passed.
- Files/PRs:
  - Key paths: `main/database.ts`, `main/migrations.ts`, `main/repositories/*`, `main/settings.ts`, `main/ai.ts`, `main/ipc.ts`, `main/index.ts`, `main/content-sync.ts`, `main/pack-manager.ts`, `docs/adr/0011-sqlite-scope.md`, `PLAN.md`.
- Next:
  - Build the inspector shell and finish the remaining Settings/Coding primitive migration; then clean-VM installs and the Phase 3 gap analysis.
- Notes/decisions:
  - The repository split keeps SQL out of IPC and service classes while avoiding a generic query layer.
  - `design_attempts` exists for Phase 5, but the current single `design_scenes` sandbox row remains the live design workspace until scenario attempts land.
  - Content tables are not mirrored into SQLite; ADR-0011 explains the tradeoff and the future derived-table escape hatch.

### 2026-10-23 — Phase 2 — Playwright smoke

- Status: in progress (Playwright suite landed and wired into CI)
- Done:
  - Added `@playwright/test` and an Electron suite in `apps/desktop/e2e/app.spec.ts`.
  - The test drives a fresh-profile onboarding (TypeScript, 45-minute goal, no AI), lands on Today, changes the theme in Settings, verifies FTS search with a term that only exists in the problem statement, checks the empty-result state, then relaunches with the same profile and asserts onboarding stays completed and the theme/language/goal persist.
  - Added `playwright.config.ts`, `tsconfig.e2e.json`, `test:e2e`, and the root `smoke:playwright` script (`build` + `playwright test`). The CI Node job runs the suite on macOS and Windows after the build; GitHub Actions run 40059546594 passed both.
  - Added explicit `aria-label`s to the Settings selects. Their wrapping labels include the option text, which made `getByLabel(..., { exact: true })` unreliable and gave assistive tech noisy names.
- Tests run:
  - `pnpm smoke:playwright` — passed (1 test, 5.4s) on macOS.
  - GitHub Actions CI run 40059546594 — all jobs passed, including the Playwright smoke step on macOS and Windows.
  - `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm content:validate` — passed.
  - `pnpm smoke:e2e` — passed with the existing pack, judge, AI, and search coverage.
- Files/PRs:
  - Key paths: `apps/desktop/e2e/app.spec.ts`, `apps/desktop/playwright.config.ts`, `apps/desktop/tsconfig.e2e.json`, `apps/desktop/package.json`, `package.json`, `.github/workflows/ci.yml`, `renderer/src/views/SettingsView.tsx`.
- Next:
  - Finish the Settings/Coding primitive migration, add the app-layout inspector, and split the database into repositories.
- Notes/decisions:
  - The Playwright suite complements the CDP smoke instead of replacing it: Playwright covers real user interaction, relaunch, and persistence; the CDP harness keeps the judge, AI, pack, and log coverage that needs privileged setup.
  - Each launch uses a fresh `--user-data-dir`; the relaunch reuses it and asserts the profile survived.

### 2026-10-23 — Phase 2 — Content pack import and removal

- Status: in progress (pack management landed; Playwright still pending)
- Done:
  - Added a pack manager that imports a folder or `.zip`, validates the manifest and referenced files before installing, and rejects duplicates, bundled IDs, symlinks, unsafe paths, encrypted archives, and oversized archives (100 MB archive / 200 MB expanded / 10k entries).
  - Preview returns a one-time 15-minute token bound to the validated files. Install copies through a staging directory and atomically renames into `<userData>/packs/<id>`, then reloads content and rebuilds the FTS index. A failed reload removes the new pack and restores the previous catalog.
  - Removal refuses bundled packs and paths outside `<userData>/packs`, deletes only the pack directory, and keeps attempts and drafts. Stale import/staging directories are cleaned at startup after an hour.
  - Added `packs:list`, `packs:preview`, `packs:install`, and `packs:uninstall` to the IPC contract, with Zod schemas and the preload bridge.
  - Added a Content packs card to Settings: bundled/imported badges, version, counts, license, attribution, ZIP and folder import buttons, a preview confirmation with warnings and the responsibility disclaimer, structured validation errors, and a removal confirmation. The library refreshes through a renderer event after either operation.
  - Added a portable smoke fixture pack (`smoke-fixture/echo`, Python-only, 3 sample + 15 hidden tests, unique “quasar” term), built as a stored ZIP at smoke runtime. The smoke covers preview, install, list, FTS search, rejection of bundled removal, uninstall, and attempt preservation, and then drives the same flow through the Settings UI. Optional `BASE_CASE_SMOKE_SCREENSHOTS` captures the card and dialogs.
- Tests run:
  - `pnpm format:check`, `pnpm lint`, `pnpm typecheck` — passed.
  - `pnpm test` — passed (27 TypeScript tests, including 6 new ZIP safety tests).
  - `pnpm content:validate` and the fixture pack validation — passed.
  - `pnpm build && pnpm smoke:e2e` — passed with `packInstall`, `packSearch`, `packUninstall`, `packAttemptsPreserved`, and `packUi` all true.
  - `pnpm package:mac` — DMG/ZIP built; confirmed `yauzl` and `pend` are present in `app.asar`.
  - Visual CDP check of the content-pack card, import confirmation, and removal confirmation.
- Files/PRs:
  - Key paths: `main/pack-manager.ts`, `main/zip.ts`, `main/content-sync.ts`, `main/index.ts`, `main/ipc.ts`, `main/ipc-schemas.ts`, `shared/types.ts`, `shared/ipc.ts`, `preload/index.ts`, `renderer/src/views/SettingsView.tsx`, `renderer/src/App.tsx`, `scripts/smoke-electron.mjs`, `scripts/fixtures/packs/smoke-fixture/`.
- Next:
  - Playwright smoke coverage, the remaining Settings/Coding primitive migration, and the repository split.
- Notes/decisions:
  - ZIP and folder imports have separate buttons because Windows cannot combine file and folder pickers in one native dialog.
  - `yauzl` is the only new runtime dependency; it is externalized and packaged, and extraction still applies its own limits and path checks.
  - Imported packs are marked “Unverified”; the confirmation carries the responsibility disclaimer.
  - Pack upgrades are explicit: remove the old pack first. This avoids partially replacing a pack that is in use.

### 2026-10-23 — Phase 2 — First-run onboarding

- Status: in progress
- Done:
  - Added a three-step first-run flow (language, daily goal, optional AI) plus a welcome and finish screen, styled with the new design-system primitives.
  - The flow makes the offline/no-account/no-telemetry promise explicit, allows skipping, and offers the bundled Pair Sum problem as the first exercise.
  - Added `onboardingCompleted` to the persisted settings schema. Existing settings without the field fall back to defaults and show onboarding once; later saves preserve completion.
  - Completing onboarding writes the preferred language, daily goal, review-reminder choice, and optional mock AI provider, then marks onboarding complete.
  - Gated the main shell and global shortcuts until onboarding finishes; returning users skip the flow entirely.
  - Extended `pnpm smoke:e2e` to drive all onboarding steps on a fresh profile and assert completion persisted.
  - Visually checked the welcome and language steps via CDP; fixed the ghost-button UA background exposed by the no-preflight Tailwind setup.
- Tests run:
  - `pnpm typecheck`, `pnpm lint`, `pnpm test` — passed.
  - `pnpm build && pnpm smoke:e2e` — passed with `onboarding: true`, plus the full judge/settings/search/palette loop.
  - Visual CDP check: welcome and language screens render correctly in the light theme; no main-process errors.
- Files/PRs:
  - Key paths: `renderer/src/views/OnboardingView.tsx`, `renderer/src/App.tsx`, `shared/types.ts`, `main/ipc-schemas.ts`, `scripts/smoke-electron.mjs`.
- Next:
  - Pack install/uninstall UI, Playwright coverage, and the remaining Settings/Coding migration to the primitive layer.
- Notes/decisions:
  - Onboarding AI setup only offers None or Mock. Real providers and key entry stay in Settings so onboarding never collects a secret.
  - Completion is a single boolean for now; add an onboarding version bump if the flow changes materially.

### 2026-10-23 — Phase 2 — Design-system foundation

- Status: in progress (primitives and first migrations landed)
- Done:
  - Added Tailwind CSS 4 through the Vite plugin without importing preflight, so Excalidraw and CodeMirror keep their own resets. Added semantic `bc-*` colors mapped to the existing light/dark CSS variables and a `dark` variant bound to `[data-theme]`.
  - Added Radix-based primitives: Button, Input/Field, Badge, Dialog, Tooltip, Tabs, Toast, Progress, plus `cn()` (clsx + tailwind-merge).
  - Migrated the command palette to Radix Dialog + Tailwind, including focus trapping, accessible title/description, keyboard navigation, and the existing smoke-test hooks.
  - Migrated the top bar actions to the new Button/Badge and wrapped the command trigger in a Tooltip.
  - Replaced inline settings save confirmations with the new Toast; the first-run settings load and judge errors still use the persistent error panel.
  - Verified light-theme rendering with CDP screenshots; fixed missing UA-button resets exposed by intentionally skipping preflight.
- Tests run:
  - `pnpm typecheck`, `pnpm lint`, `pnpm test` — passed.
  - `pnpm build && pnpm smoke:e2e` — passed with search, palette, settings, logs, and the full judge loop.
  - Visual CDP check: light theme rendered correctly for the command palette and Settings; no main-process errors.
- Files/PRs:
  - Key paths: `renderer/src/design/tailwind.css`, `renderer/src/ui/*`, `renderer/src/components/CommandPalette.tsx`, `renderer/src/App.tsx`, `renderer/src/main.tsx`, `renderer/src/views/SettingsView.tsx`.
- Next:
  - Continue migrating Settings/Coding to the primitives, then onboarding and pack install/uninstall; finish with Playwright coverage.
- Notes/decisions:
  - Preflight is intentionally skip-imported. Primitives must reset browser defaults explicitly (`border-0`, transparent backgrounds) rather than relying on Tailwind's base layer.
  - Legacy view CSS remains until each surface is migrated; new UI should use `ui/` primitives and `bc-*` utilities.

### 2026-10-23 — Phase 2 — Command palette, shortcuts, and content search

- Status: in progress
- Done:
  - Added a command palette (`Cmd/Ctrl+K`) with fuzzy filtering, keyboard navigation, and commands for navigation and theme switching. It also lists problems from the loaded content packs.
  - Added a shortcut registry (`lib/shortcuts.ts`) and bound `Cmd/Ctrl+1…6` navigation plus `Cmd/Ctrl+Enter` / `Cmd/Ctrl+Shift+Enter` run and submit handling.
  - Added SQLite migration 2 with an FTS5 `problem_search` table indexing title, patterns, pack name, and statement.
  - Added `content:search` to the IPC contract and used it from the coding list with a local-filter fallback while the debounced query runs.
  - Added user pack loading from `<userData>/packs/*`; invalid or duplicate user packs are logged and skipped, while a broken bundled pack still fails startup.
  - Problem summaries now carry pack id, pack name, and source; the coding list shows the pack count and a pack tag.
  - Fixed a main-process crash on quit: the judge client now handles asynchronous EPIPE on `stdin`/`stdout`/`stderr`, checks stream state before shutdown writes, and guards `kill()`.
  - Added main-process `uncaughtException` and `unhandledRejection` handlers that write to the structured log and show an actionable “Quit / Open logs folder” dialog instead of an opaque crash modal.
  - Hardened `scripts/smoke-electron.mjs`: it now aborts immediately if Electron writes an uncaught-exception line to stderr or exits mid-test, and it covers FTS search, settings/logs, and the command palette.
  - Verified graceful shutdown separately through CDP `Browser.close`: the app exited with code 0 and produced no EPIPE or uncaught-exception output.
- Tests run:
  - `pnpm typecheck`, `pnpm lint`, `pnpm test` — passed (24 TypeScript tests plus the Go suites).
  - `pnpm build && pnpm smoke:e2e` — passed with `search: true`, `palette: true`, 5/5 sample, 39/39 hidden, drafts, scene, AI, key storage, attempts, and backup.
- Files/PRs:
  - Key paths: `renderer/src/components/CommandPalette.tsx`, `renderer/src/lib/shortcuts.ts`, `shared/ipc.ts`, `main/ipc-schemas.ts`, `main/content.ts`, `main/database.ts`, `main/judge.ts`, `main/index.ts`.
- Next:
  - Pack install/uninstall and content management UI; design-system migration; onboarding shell; Playwright smoke.
- Notes/decisions:
  - FTS5 is available in Node's bundled SQLite and is covered by a migration test.
  - Search queries are quote-escaped and prefix-matched; FTS syntax errors return an empty result instead of failing the IPC call.
  - The smoke harness treats any main-process uncaught exception as fatal even if Electron shows a modal and keeps the window open.

### 2026-10-23 — Phase 2 — App foundation, part 1

- Status: in progress
- Done:
  - Added a shared, dependency-free channel contract (`shared/ipc.ts`) and moved every request schema into `main/ipc-schemas.ts`.
  - Wrapped all IPC handlers in `{ ok, data } | { ok, error }` envelopes with stable error codes (`invalid_request`, `not_found`, `judge_unavailable`, `timeout`, `internal_error`). The preload unwraps envelopes and throws typed `Error` objects, so renderer code keeps its existing promise API.
  - Added structured JSON logging with size-based rotation (2 MiB × 5 files), level filtering (`BASE_CASE_LOG_LEVEL`), and recursive redaction of API keys, tokens, passwords, and secrets. Logs live under `<userData>/logs/app.log` and the path is exposed in App Info and Settings.
  - Added a persisted `SettingsStore` backed by SQLite: theme (system/light/dark), preferred language, editor font size/tab size/word wrap, daily goal, and review reminders. Invalid stored values fall back to defaults.
  - Added a renderer `SettingsProvider` that applies the theme immediately, follows OS theme changes in system mode, and caches the choice to avoid a first-paint flash.
  - Wired settings into the editor: font size, tab size, and line wrapping reconfigure through CodeMirror compartments without remounting the document. Preferred language seeds new problem workspaces.
  - Added window size/position/maximized persistence with display-intersection clamping, plus debounced saves on move/resize.
  - Added a native application menu with File/Edit/View/Window/Help, About, licenses, documentation, and an “Open data folder” action.
  - Added 16 Vitest tests for logging/rotation, settings persistence/fallback, IPC error mapping, and window-state clamping.
  - Extended `pnpm smoke:e2e` to exercise settings read/update/persistence and to assert that the startup and IPC log lines reach `app.log`.
- Tests run:
  - `pnpm typecheck`, `pnpm lint`, `pnpm test` — passed (20 TypeScript tests plus the Go suites).
  - `pnpm build && pnpm smoke:e2e` — passed; smoke now reports `settings: true`, `logs: true`, 5/5 sample, 39/39 hidden, drafts, scene, AI, key storage, 3 attempts, 1 backup.
- Files/PRs:
  - Key paths: `apps/desktop/src/shared/ipc.ts`, `main/ipc-schemas.ts`, `main/ipc-errors.ts`, `main/logger.ts`, `main/settings.ts`, `main/window-state.ts`, `main/menu.ts`, `renderer/src/settings.tsx`.
- Next:
  - Command palette and shortcut registry; FTS5 content search and user packs; repository split; onboarding shell; Playwright smoke.
- Notes/decisions:
  - IPC messages are validated at the main boundary; renderer promises still resolve to plain values. Error codes are available on thrown error objects in the preload, but Electron may strip custom properties across `contextBridge`; the main process keeps the authoritative code in logs.
  - Logging never records request payloads, only channel names, timings, and error codes/messages.
  - The design-system migration (Tailwind + Radix) is intentionally deferred until the shell features settle, to avoid a large mixed refactor.

### 2026-10-23 — Phase 1 — Windows re-verification PASS

- Status: Windows verified; clean-VM installs pending
- Done:
  - Re-verified the rebuilt Windows artifact (`Build installers` run `40012846163`, commit `79bc5f7`) on the same physical Windows 11 machine.
  - All eight focused checks passed: runtime selection with the Store alias present, Python/TypeScript samples and hidden tests, submit-mode TLE, judge-kill process hygiene and recovery, canvas autosave/idle writes/restore, friendly judge errors, minimum-width path wrapping, and the persistence/portable regression.
  - Confirmed D1–D5 and D7–D9 are fixed. D6 (empty uninstall folder) was not re-run; it remains a minor known issue.
  - New build: per-user install at `%LOCALAPPDATA%\Programs\Base Case`, per-user shortcut, `/currentuser` uninstall entry, no UAC.
  - Polish: runtime paths now break at path separators in Settings instead of mid-segment.
  - Updated `docs/spikes/phase-1-report.md` and `PLAN.md` Phase 1 status with the Windows results and measurements.
- Tests run:
  - Windows artifact: Python 5/5 (257 ms) and 39/39 (2,070 ms); TypeScript 5/5 (490 ms) and 39/39 (3,302 ms); submit TLE 6,226 ms; no orphan harness processes after killing the judge; canvas `updated_at` stable over 10 s idle; PNG export 440×340; mock AI streamed; portable build ran both languages.
  - Local: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm smoke:e2e`, `go test -C services/judge`, and Windows cross-build/vet all passed before the artifact was built.
  - GitHub Actions `CI` run `40011834533` and `Judge conformance` run `40011834474` — success on macOS and Windows.
- Files/PRs:
  - Code: `apps/desktop/src/renderer/src/views/SettingsView.tsx` (path breaking), `docs/install.md`, `docs/spikes/windows-verification.md`, `docs/spikes/phase-1-report.md`, `PLAN.md`, `PROGRESS.md`.
  - Verification reports are kept local and ignored by git.
- Next:
  - Clean-VM installs for both OSes; re-check uninstall on Windows.
  - Start Phase 2.
- Notes/decisions:
  - The focused delta did not repeat the full 21-row checklist. Uninstall, SmartScreen via browser download, display scaling, and a real AI provider remain unverified in this round.
  - The job-object fix and canvas debounce fix are confirmed on Windows hardware, not just cross-compiled.

### 2026-10-23 — Phase 1 — Windows verification report triage

- Status: in progress (fixes written; rebuilt artifact and retest pending)
- Done:
  - Reviewed `windows-verification-report.md` (artifact `b18153e`, source smoke at `c1a4c83`). The report confirms the core loop and the TypeScript path work on Windows.
  - Fixed runtime discovery: the judge now probes `python`/`python3` (and `node`) with `--version` and selects the first candidate that actually runs, so the Microsoft Store alias stub cannot win by PATH order alone.
  - Fixed `judge doctor`: `available` is set only after a successful version probe; a failed probe is reported with `available: false` and the error.
  - Fixed orphaned runtime children on Windows: each run child is placed in a kill-on-close Job Object via `golang.org/x/sys/windows`, so the process tree dies even if the judge sidecar is killed.
  - Fixed submit/sample time-limit storms: the runner stops at the first non-compile failure, so a 39-test submit no longer spends 39 × 6 s behind a 120 s client timeout.
  - Fixed the canvas autosave loop: only element/file changes schedule a save, identical snapshots are skipped, and the “Saving…” indicator settles.
  - Replaced raw Electron IPC judge errors with concise messages for sidecar exit, timeout, and startup failures.
  - Allowed long runtime paths to wrap in Settings at the minimum window size.
  - Documented the assisted installer's per-user/all-users choice, the UAC implications, and the empty-folder uninstall leftover.
- Tests run:
  - `go test -C services/judge -count=1 ./...` — passed, including new runtime-probe, doctor-availability, and first-failure tests.
  - `GOOS=windows GOARCH=amd64 go build ./...` and `go vet ./...` — passed.
  - `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` — passed.
  - `pnpm smoke:e2e` — passed: 5/5 sample, 39/39 hidden, wrong answer, draft, scene, mock AI, local SSE, key storage, 3 attempts, 1 backup.
- Files/PRs:
  - Pending commit: `services/judge/internal/judge/{runtimes.go,runtimes_test.go,runtimes_unix_test.go,runner.go,runner_test.go,process_windows.go,process_unix.go}`, `services/judge/{go.mod,go.sum}`, `apps/desktop/src/renderer/src/views/{CodingView,DesignView}.tsx`, `apps/desktop/src/renderer/src/workspace.css`, `docs/install.md`, `docs/spikes/windows-verification.md`, `windows-verification-report.md`.
- Next:
  - Commit and push, dispatch “Build installers,” and re-run the Windows checklist on the rebuilt artifact.
  - Verify the Job Object leak fix by killing `judge.exe` during a run and checking for `python.exe -I harness.py` / `node` children.
  - Verify submit-mode TLE now returns in roughly one limit interval, and that the canvas indicator reaches “Saved locally” without idle database writes.
- Notes/decisions:
  - The Windows report's D1 was already fixed at `c1a4c83`; the new runtime probing makes the fix independent of PATH ordering.
  - The empty install directory and assisted-installer UAC behavior are documented as minor installer issues, not Phase 1 blockers.
  - Windows-specific Job Object and canvas behavior still need confirmation on the Windows machine; local tests can only cross-compile the judge.

### 2026-10-23 — Phase 1 — Windows CI green

- Status: in progress (Windows CI verified; clean-VM installs pending)
- Done:
  - Pushed the repository to `origin` (`https://github.com/MohammedArab1/Base-Case.git`) and fixed the red Windows CI.
  - Node job: replaced POSIX path assertions in `packages/schema/src/validate.test.ts` with `node:path` `resolve`/`join`.
  - Go jobs: added `actions/setup-python` and `actions/setup-node` so the Python and TypeScript adapters have real runtimes; prefer `python` over the Windows Store `python3` stub on Windows.
  - Added `scripts/annotate-go-tests.mjs`, which consumes `go test -json` and emits GitHub check annotations, so Windows Go failures name the test and message instead of only “exit code 1”.
  - Raised the slow-output test budget and mirrored the content pack's 3× language multipliers in the judge test fixture, fixing a Windows TypeScript cold-start timeout.
  - Added `docs/spikes/windows-verification.md`, a complete Windows install and end-to-end checklist with a report template.
  - Made `scripts/smoke-electron.mjs` spawn Electron from its resolved binary path and use `pnpm.cmd` on Windows, so `pnpm smoke:e2e` can run on Windows.
- Tests run:
  - GitHub Actions `CI` run `40003640419` — success on `macos-latest` and `windows-latest` (format, lint, typecheck, unit tests, content validation, app bundles).
  - GitHub Actions `Judge conformance` run `40003640429` — success on `macos-latest` and `windows-latest` (doctor, vet, protocol/unit tests).
  - GitHub Actions `Build installers` run `40002549825` — success on both platforms; artifacts `base-case-macOS` (397.9 MB) and `base-case-Windows` (409.6 MB).
  - Local re-verification: `pnpm --filter @base-case/schema test`, `go test -C services/judge -count=1 ./...`, `pnpm smoke:e2e` (5/5 sample, 39/39 hidden, draft, scene, mock AI, local SSE, key storage, 3 attempts, 1 backup), and Prettier on changed files — passed.
- Files/PRs:
  - `b18153e` initial commit (Phases 0–1); `1a7a617` Windows CI fixes; `9e14439` judge fixture limits; `47d2931` name decision.
  - Key paths: `.github/workflows/ci.yml`, `.github/workflows/judge.yml`, `packages/schema/src/validate.test.ts`, `services/judge/internal/judge/runtimes.go`, `services/judge/internal/judge/runner_test.go`, `scripts/annotate-go-tests.mjs`, `docs/spikes/windows-verification.md`.
- Next:
  - Run `docs/spikes/windows-verification.md` on a Windows machine and file the report.
  - Install the macOS artifact on a clean VM and record the result.
  - Complete the trademark search, then start Phase 2.
- Notes/decisions:
  - Product name confirmed as “Base Case” (D019); a trademark search and domain registration remain before public branding.
  - CI now installs Python and Node for judge tests. Production still must bundle or transpile runtimes before alpha (ADR-0010 remains Proposed).
  - The Windows TypeScript timeout was a fixture mismatch, not a judge defect: real problems apply language multipliers, so TypeScript gets 6 s for pair-sum.

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
