# MVP release-candidate build record

Date: 2026-10-25
Version: `0.1.0-alpha`
Code commit: `7ef5b5d` (includes the API key decryption fix); later
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
| `Base-Case-0.1.0-alpha-arm64.dmg` | 253 M | `d48abd97ecd354ed56aed2dd72694e2c0e872049008d8da175ad4740a2d9f3e4` |
| `Base-Case-0.1.0-alpha-arm64.zip` | 254 M | `8ac87f429b484e14a3aa86b6f038280313b7fabbfca6d4c261c3b9643cf07d92` |
| `Base-Case-0.1.0-alpha-x64.dmg`   | 259 M | `92058f5d192736a5715ded8fd613e4d62eb497946337c10d347f9ca9e9c2ecec` |
| `Base-Case-0.1.0-alpha-x64.zip`   | 259 M | `93bdb16fc0806292466e5ba505c1a7c03fc891847638a81f34415426e4206679` |

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

- Packaged app: 2766 ms cold start, 48 ms problem open, 410 ms design canvas,
  316 ms judge run, 294.8 MB idle / 377.7 MB working memory.
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
