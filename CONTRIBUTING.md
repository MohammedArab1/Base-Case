# Contributing

Thanks for helping. Base Case is a local-first practice app; correctness,
safety, and clear feedback matter more than feature count.

By participating, you agree to the `CODE_OF_CONDUCT.md`. Code contributions are
licensed under MIT; content contributions are licensed under CC BY-SA 4.0.

## Setup

Requirements: Node.js 24+, pnpm 12+ (via Corepack), Go 1.27+, and macOS 13+ or
Windows 10 21H2+ / 11.

```sh
corepack enable
corepack pnpm install
corepack pnpm judge:build
corepack pnpm dev
```

Before opening a PR:

```sh
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm content:validate
corepack pnpm smoke:e2e
```

## Repository areas

- `apps/desktop` — Electron main, preload, React renderer.
- `services/judge` — Go judge sidecar, harnesses, checkers, conformance.
- `packages/schema` — content schemas and validation.
- `packages/content-cli` — content validation and authoring commands.
- `content` — bundled packs and templates.
- `scripts` — judge build, Playwright/CDP smoke, packaged-app measurement.
- `docs` — decisions, architecture, authoring, spikes, and process.

## Development rules

- Keep the renderer sandboxed. Do not add Node integration or raw IPC.
- Validate every IPC payload in main.
- Keep core features usable offline.
- Prefer proven, small dependencies. Justify a new dependency in the PR.
- Add tests for behavior, especially judge, content validation, migrations, and
  data durability.
- Do not log secrets, API keys, Authorization headers, or user code.
- Update `PROGRESS.md` when you complete significant work.
- Record expensive-to-change decisions in `docs/adr/`.

## Content contributions

Read `docs/authoring/content-policy.md` and the relevant authoring guide before
writing a problem or design scenario.

Non-negotiables:

- Original statements, examples, constraints, and tests only.
- No scraping and no copied LeetCode content.
- License and attribution fields filled in.
- Reference solutions pass every test in Python and TypeScript.
- Tests are deterministic, independent, and include edge cases.
- Hints do not reveal full code before level 4.

Run `corepack pnpm content:validate` and test the content in the app. A content
PR needs one maintainer review for correctness and one for clarity; for alpha,
the same reviewer may cover both.

## DCO

Sign off every commit:

```sh
git commit -s -m "feat(judge): add python harness"
```

The sign-off certifies that you wrote the contribution or have the right to
submit it under the project licenses. See https://developercertificate.org/.

## Pull requests

Include:

- what changed and why;
- how it was tested;
- screenshots or a short recording for UI changes;
- platform coverage (macOS and Windows);
- license/attribution notes for content;
- confirmation that no copied material was used;
- any migration, security, or performance impact.

Keep PRs focused. Do not mix refactors with behavior changes unless the refactor
is required. Do not merge large AI-generated PRs without human review.

## Review and merge

- CI must pass.
- One approval is required for code; content also needs a license/originality
  check.
- Squash or rebase as requested; keep commit sign-offs.
- Update `PROGRESS.md` before merging a phase-completing PR.

## Good first issues

Look for the `good first issue` label. Small, self-contained contributions are
welcome: an original easy problem, an empty state, a keyboard shortcut, a
conformance fixture, a troubleshooting doc, or an error-message improvement.
