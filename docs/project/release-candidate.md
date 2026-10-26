# MVP release-candidate build record

Date: 2026-10-25
Version: `0.1.0-alpha`
Code commit: the editor/provider/canvas fix commit (see git history); later
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
| `Base-Case-0.1.0-alpha-arm64.dmg` | 253 M | `13d364c0b3e09035cdbc90faec2d2507c4576ef6d579fb05250054621b8b23f1` |
| `Base-Case-0.1.0-alpha-arm64.zip` | 254 M | `ac1658c97f2019e46b3abb68dfbca6ad5279cdabbed1a450766f359ad71cb175` |
| `Base-Case-0.1.0-alpha-x64.dmg`   | 259 M | `1d56521eeafb73073d55cea85b416cc5d89fb747fe4e124ddc48ceb2ffb333cb` |
| `Base-Case-0.1.0-alpha-x64.zip`   | 259 M | `0df6bd8f81326732b529b37c693d7bdf33ef2d2d86f4f190cb253e2799bc526f` |

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

- Packaged app: 2496 ms cold start, 43 ms problem open, 404 ms design canvas,
  265 ms judge run, 295.9 MB idle / 380.2 MB working memory.
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
