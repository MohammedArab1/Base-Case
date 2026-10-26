# MVP release-candidate build record

Date: 2026-10-25
Version: `0.1.0-alpha`
Code commit: `b831d83` (editor, canvas, and provider fixes); later
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
| `Base-Case-0.1.0-alpha-arm64.dmg` | 253 M | `a0315919ed39461b5a77a25a012ac8a7d8beb610d9dba15a703d9db53627af70` |
| `Base-Case-0.1.0-alpha-arm64.zip` | 254 M | `cc78f6c0026794c8fb31fdc28328ecf0a0dc81eb54db2314d466028a46e420c3` |
| `Base-Case-0.1.0-alpha-x64.dmg`   | 259 M | `3609e3f1b820ba3dfd1bf7d27897c3945c3c24e8c1d2548e4642e23d3681fd89` |
| `Base-Case-0.1.0-alpha-x64.zip`   | 259 M | `8b0ec45480fd206e680c66aa40de319a2c8325df7a0c9ddd4b0d29eca4580252` |

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

- Packaged app: 2777 ms cold start, 48 ms problem open, 407 ms design canvas,
  341 ms judge run, 291.0 MB idle / 368.0 MB working memory.
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
