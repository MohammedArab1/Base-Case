# MVP release-candidate build record

Date: 2026-10-25
Version: `0.1.0-alpha`
Code commit: `0e5ed87` (includes the custom app icon); later
documentation-only commits do not change packaged bytes
Platforms: macOS arm64, macOS x64
Status: **build candidate only** — not tagged and not published.

This build is the Phase 9 MVP feature-complete candidate. It is intentionally
not tagged or released until the private beta and the external gates below are
complete.

> **Historical record.** This candidate predates the 79-problem and learning-
> library expansions. The artifacts and checksums below are not release
> candidates for the current 81-problem, 39-lesson build. Do not rebuild or
> publish from this record without a new candidate entry and fresh checksums.
>
> **2026-10-27 update.** A newer 79-problem build at `72e9b4d` was produced by
> [Build installers run 40607714499](https://github.com/MohammedArab1/Base-Case/actions/runs/40607714499).
> The Windows installer passed diagnostics 9/9 with bundled Node/Python,
> closing B2. B1 was closed by owner waiver because no clean macOS VM was
> available. The current working tree adds the Learn library (81 problems and 39
> lessons) and still needs a fresh build, checksums, and packaged smoke test
> before tagging.
>
> **2026-10-28 update.** The system-design track expanded from 8 to 17 lessons,
> for a total of 39 lessons. No installer was rebuilt for this content change;
> a fresh candidate record and packaged smoke test are still required.

## Artifacts

Produced with:

```sh
CSC_IDENTITY_AUTO_DISCOVERY=false pnpm package:mac
pnpm release:checksums
```

| Artifact                          | Size    | SHA-256                                                            |
| --------------------------------- | ------- | ------------------------------------------------------------------ |
| `Base-Case-0.1.0-alpha-arm64.dmg` | 253.8 M | `762bc89dcd460cbd8ab727c44b041ff71ad5df0137c2ee1a6934ded300befa5e` |
| `Base-Case-0.1.0-alpha-arm64.zip` | 253.5 M | `6e79d45032b98834a8ca06dfa5b8bd56328e776df66ee6b05a091bc60db967a8` |
| `Base-Case-0.1.0-alpha-x64.dmg`   | 259 M   | `1afaa53ddfdb6d2c6a9bf51836c42bb64796d89afbedb066f8d775e171e0d7e5` |
| `Base-Case-0.1.0-alpha-x64.zip`   | 259 M   | `32ab1b05c1ada737ab6abdaac95d055e9c90e73dce57ed072baccff56154cefc` |

The app is unsigned. Gatekeeper and SmartScreen will warn; follow
`docs/install.md`. Verify the checksum before running.

## What the candidate contains

- 25 coding problems and 8 design scenarios.
- Python 3.12.15 and Node 24.22.0 bundled per architecture.
- Matching arm64/x64 judge binaries.
- FSRS review, mistake tags, activity chart, design canvas and rubric.
- Content-pack importer with validation, preview, disclaimer, Unverified badge,
  and uninstall that preserves attempts.
- Optional AI with mock/OpenAI-compatible providers, context preview,
  guardrails, design notes review, explain-back, and confirmed mistake tags.
- Diagnostics self-test, export/import, and verified backups.

## Verification completed

- Packaged app: 2619 ms cold start, 50 ms problem open, 409 ms design canvas,
  451 ms judge run, 289.8 MB idle / 379.1 MB working memory.
- Both app bundles pass `codesign --verify --deep --strict`; the judge prevents Python bytecode writes inside the signed bundle.
- Embedded binaries confirmed by architecture with `file`.
- 50/50 reference solutions accepted through the real judge.
- 117 unit tests, 4 schema tests, Go suites, Electron smoke, and 7 Playwright
  tests pass locally.
- CI green on all four Node/Go macOS/Windows jobs for `40cfe49` and `c22a1b2`.
- `pnpm audit --prod` clean after transitive overrides.

## Gates before tagging `v0.1.0-alpha`

- B1 — closed by owner waiver (Windows hardware install passed; macOS clean-OS isolation accepted for the alpha).
- B2 — done (Build installers run `40607714499`; Windows installer launched).
- B3 — done (real-model eval: 59/60 reviewed, 100% diagnosis accuracy, 4.9/5 helpfulness, 0 leaks).
- B11 — manual VoiceOver/NVDA, high-contrast, zoom, and canvas keyboard pass.
- B10 — private beta with no open P0/P1 bugs.
- B4 — closed for the alpha via owner waiver (2026-10-30). The Full-tier review and remediation covered the current 81 + 8 + 39 content set; all findings are closed and the originality claims are restored. An independent human second-person review remains a v1.0 requirement. See `docs/project/content-review-findings.md`.
- Legal/name/domain checks (B5, B7) before public branding.

Do not tag or publish this build until those gates are resolved.
