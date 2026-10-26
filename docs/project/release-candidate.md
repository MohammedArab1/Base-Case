# MVP release-candidate build record

Date: 2026-10-25
Version: `0.1.0-alpha`
Code commit: `aca148d` (layout and signed-bundle fixes); later
documentation-only commits do not change packaged bytes
Platforms: macOS arm64, macOS x64
Status: **build candidate only** — not tagged and not published.

This build is the Phase 9 MVP feature-complete candidate. It is intentionally
not tagged or released until the private beta and the external gates below are
complete.

## Artifacts

Produced with:

```sh
CSC_IDENTITY_AUTO_DISCOVERY=false pnpm package:mac
pnpm release:checksums
```

| Artifact                          | Size    | SHA-256                                                            |
| --------------------------------- | ------- | ------------------------------------------------------------------ |
| `Base-Case-0.1.0-alpha-arm64.dmg` | 251.9 M | `fcf24e295a0df56e2435ea802188ea41a15eaffdeddd50b20c0d405f41f03550` |
| `Base-Case-0.1.0-alpha-arm64.zip` | 252.7 M | `e553f8ed6372d9c8ebf23fc0213d6f851bf8234ac0ed9b950627e48583312ba5` |
| `Base-Case-0.1.0-alpha-x64.dmg`   | 259 M   | `e8d40a3f14945718ff00e41e1f19e3e67c913d97f9706fdf416f7adf5b30972f` |
| `Base-Case-0.1.0-alpha-x64.zip`   | 259 M   | `e8b4da502c3523679ff2c99f7f4e2a2c599ec2b632874af010c2d607056990c3` |

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

- B1 — clean-VM macOS and Windows installs.
- B2 — manual Windows installer workflow and first launch.
- B11 — manual VoiceOver/NVDA, high-contrast, zoom, and canvas keyboard pass.
- B10 — private beta with no open P0/P1 bugs.
- B4 — second-person review of the 25 + 8 content set.
- Legal/name/domain checks (B5, B7) before public branding.

Do not tag or publish this build until those gates are resolved.
