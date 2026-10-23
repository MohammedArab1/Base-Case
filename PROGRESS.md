# Progress Log

> Last updated: 2026-10-23
> Current phase: Phase 1 — Technical spike (macOS verified; Windows report triaged, fixes awaiting rebuild)
> Overall status: On track — macOS verified; Windows CI green; the first Windows artifact exposed runtime-selection, orphan-process, and timeout issues that are fixed in the working tree
> Next milestone: rebuild the Windows artifacts, re-run the affected checks, then clean-VM verification and Phase 2

This is the living status document for the project. `PLAN.md` describes the intended work; this file records what is actually done, what is in progress, what is blocked, and what comes next. Update it at the end of every work session and whenever a phase, section, or significant task is completed. See `PLAN.md` Section 0.1 for the full rules and template.

## Current status

| Area | Status | Last updated | Notes |
|---|---|---|---|
| Plan | Done | 2026-10-23 | `PLAN.md` v1.1; macOS + Windows scope; progress log required |
| Phase 0 — Decisions and project setup | In progress | 2026-10-23 | Code/docs complete; name confirmed as “Base Case.” Pending: trademark search before public launch; GitHub milestones/labels/board |
| Phase 1 — Technical spike | In progress | 2026-10-23 | macOS verified and packaged; Windows report found runtime-selection, orphan-process, and timeout defects; fixes are in the working tree and need a rebuilt artifact + retest |
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

1. Commit the Windows-report fixes, rebuild the Windows artifacts from `main`, and re-run `docs/spikes/windows-verification.md` on the new build (focus: judge runtimes, orphan processes, submit TLE, canvas save state, narrow window).
2. Install the rebuilt Windows build and the macOS DMG on clean VMs and record the result.
3. Do a basic trademark search for “Base Case” before public launch (the name is confirmed). Register the domain when branding starts.
4. Add milestones for Phases 0–10, labels, and a project board using `docs/project/github-setup.md`.
5. Start Phase 2: typed IPC envelopes, structured logging, design system, repository layer, FTS5, settings, and Playwright smoke tests.

## Blockers

- **Windows retest:** the first artifact predates the Python runtime fix and does not contain the orphan-process/timeout/canvas fixes. A rebuilt installer must be tested before Phase 1 can close.
- **Clean-VM installs:** no clean macOS or Windows VM is available in this environment. Both packages build successfully in CI.
- **Name/trademark:** the name is confirmed as “Base Case.” A basic trademark search and domain registration remain before public branding; neither blocks Phase 2 engineering.
- **GitHub setup:** `gh` is not installed. Milestones, labels, and the project board still need to be created through the web UI or a token-based script.

## Work log (newest first)

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
