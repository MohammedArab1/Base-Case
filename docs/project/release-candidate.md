# MVP release-candidate build record

Date: 2026-10-25
Version: `0.1.0-alpha`
Code commit: `ebf18bf` (editor, canvas, provider, and diagnostics fixes); later
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

| Artifact                          | Size  | SHA-256                                                            |
| --------------------------------- | ----- | ------------------------------------------------------------------ |
| `Base-Case-0.1.0-alpha-arm64.dmg` | 253 M | `b507ee9789622d834f68fe7556311c50eb8b097cf8e49c8d9590e09af21d5aee` |
| `Base-Case-0.1.0-alpha-arm64.zip` | 254 M | `36bff530dff2d3303ffd334898fa06f40f189f223c90372da784a419808ac3f7` |
| `Base-Case-0.1.0-alpha-x64.dmg`   | 259 M | `1e5b0b3d3835ddf812e104df5b5bba0c1e82337e68cf7f205139fcaf086cc504` |
| `Base-Case-0.1.0-alpha-x64.zip`   | 259 M | `8071254dc8cdf4971b847c036d3cbe7c015bf89ead9973fab7c76effd9447b65` |

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

- Packaged app: 2488 ms cold start, 44 ms problem open, 415 ms design canvas,
  385 ms judge run, 290.8 MB idle / 343.5 MB working memory.
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
