# Base Case

> Working name. Base Case is a local-first practice app for coding interviews
> and system design. It is not affiliated with LeetCode or any other judge.

**Status:** Phase 1 technical spike. The macOS app is verified end to end:
secure Electron shell, real Python/TypeScript judge, SQLite persistence,
CodeMirror, Excalidraw, optional AI, and an unsigned DMG/ZIP. Windows packaging
is configured in CI but has not been run, and clean-VM installs are pending.
See `docs/spikes/phase-1-report.md`.

## Why

Online judges hide tests and say "wrong answer." Offline judges often need
Docker. AI tools tend to hand over solutions. Progress tracking is usually just
"solved / not solved." System design practice is separate from coding practice.

Base Case closes the loop: **attempt → failure → explanation → fix → review**.

- **Offline-first:** the judge, content, progress, canvas, and review queue work
  with no network.
- **Local-first:** no account, no telemetry; data stays on the machine.
- **AI is optional:** bring your own OpenAI-compatible provider. The app works
  without it.
- **Learning over grinding:** hints, explanations, mistake tags, and spaced
  repetition matter more than problem count.
- **Honest limits:** hidden tests are not a security boundary, and sandboxing is
  best-effort on Windows.

## Requirements

- Node.js 24+
- pnpm 12+ (enable with `corepack enable`; the repo pins the exact version)
- Go 1.27+ (judge sidecar)
- Python 3.10+ and Node on `PATH` for the Phase 1 judge
- macOS 13+ or Windows 10 21H2+ / 11

Linux is explicitly out of scope for the initial releases.

## Quickstart

```sh
corepack enable
corepack pnpm install
corepack pnpm judge:build
corepack pnpm dev
```

Then:

- Open **Coding**, select **Pair Sum**, and run the sample tests.
- Replace the starter code with a one-pass hash-map solution and submit.
- Open **System Design**, draw, wait for “Saved locally,” and reload.
- Configure the mock or an OpenAI-compatible provider in **Settings**.

Validation commands:

```sh
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm content:validate
corepack pnpm smoke:e2e
```

Packaging:

```sh
corepack pnpm package:mac   # unsigned DMG + ZIP
corepack pnpm package:win   # NSIS + ZIP
```

The judge uses the system Python/Node in the Phase 1 spike. Phase 3 decides
whether to bundle pinned runtimes (see ADR-0010).

## What works now

- Secure Electron + React + TypeScript shell with a narrow typed preload API.
- Original `core/pair-sum` problem with 5 sample tests, 39 hidden tests, four
  hints, an explanation, and Python/TypeScript reference solutions.
- Real Go judge execution for function signatures, with structured statuses,
  timeout/output limits, process-group kill, and exact/unordered/float checkers.
- CodeMirror editors with autosave to SQLite and language switching.
- Structured failure panel and AI context preview.
- Excalidraw canvas with local scene persistence and PNG export.
- SQLite (WAL) migrations, attempts, drafts, design scenes, settings, and
  verified startup backups.
- Optional AI: mock provider and OpenAI-compatible streaming, with keys kept in
  the main process and encrypted with `safeStorage`.

Not built yet: FSRS review, design scenarios/rubrics, content importer, full
design system, structured IPC error envelopes, bundled runtimes, Seatbelt/Job
Objects sandboxing, and the 10+4 alpha content set.

## Repository layout

```text
apps/desktop/          Electron main, preload, React renderer
services/judge/        Go judge sidecar, harnesses, checkers, protocol tests
packages/schema/       Content schemas, types, pack validation
packages/content-cli/  validate command for content packs
content/packs/core/    Bundled core pack (one original problem)
content/templates/     Problem and design templates
scripts/               Judge build, CDP smoke test, packaged-app measurement
docs/                  ADRs, architecture, authoring, spikes, project docs
```

## Documentation

- `PLAN.md` — product definition, architecture, phases, risks, decisions.
- `PROGRESS.md` — living status log; read this first when returning.
- `docs/spikes/phase-1-report.md` — measurements, gaps, go/no-go.
- `docs/install.md` — unsigned macOS/Windows install steps.
- `docs/architecture/overview.md`
- `docs/architecture/judge-protocol.md`
- `docs/architecture/threat-model.md`
- `docs/authoring/content-policy.md`
- `docs/project/definition-of-done.md`

## Security and privacy

- No telemetry, accounts, or cloud backend.
- API keys are stored with Electron `safeStorage` and never exposed to the
  renderer.
- The judge runs in a temp directory with limits, sanitized environment, and
  process-group cleanup.
- Read `SECURITY.md` before reporting a vulnerability.
- The app is a practice tool, not a formal assessment or a hostile-code sandbox.

## Contributing

See `CONTRIBUTING.md` and `docs/project/code-review-checklist.md`. Content
contributions must be original; do not copy statements, examples, constraints,
or tests. Sign off commits with `git commit -s`.

Good first issues: add an original easy problem, improve an empty state, add a
keyboard shortcut, write a troubleshooting doc, or add a judge conformance
fixture.

## License

- Code: MIT (`LICENSE`).
- Original content: CC BY-SA 4.0 (`CONTENT_LICENSE`).
- Third-party components: `NOTICE`.

"Base Case" is a provisional working name; a trademark/domain check is pending.
