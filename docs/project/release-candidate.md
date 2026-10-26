# MVP release-candidate build record

Date: 2026-10-25
Version: `0.1.0-alpha`
Code commit: `15c07c7` (the commit that contains the packaged code; later
documentation-only commits do not change packaged bytes)
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

| Artifact                          | Size  | SHA-256                                                            |
| --------------------------------- | ----- | ------------------------------------------------------------------ |
| `Base-Case-0.1.0-alpha-arm64.dmg` | 253 M | `73ff592e03e5ae8a41ec20cd02404d60dd73053968d7c3e56aa24baa039fba4b` |
| `Base-Case-0.1.0-alpha-arm64.zip` | 254 M | `9a5ac4ad459e11a00295d0a6320ebd677013ec9543a3165dd3367bf56583fe9b` |
| `Base-Case-0.1.0-alpha-x64.dmg`   | 259 M | `dec2f735c2e3474e32fa32e04ac118a084870b496d0d2c2cb38742524c2d23d6` |
| `Base-Case-0.1.0-alpha-x64.zip`   | 259 M | `6009945c26ee8dd3836e740df1aa8a8ec35b5c9de1e76f0950f6c6820f865881` |

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

- Packaged app: 3442 ms cold start, 51 ms problem open, 417 ms design canvas,
  353 ms judge run, 276.6 MB idle / 353.0 MB working memory.
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
