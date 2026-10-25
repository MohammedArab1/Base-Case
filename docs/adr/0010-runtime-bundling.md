# ADR-0010: Bundle pinned language runtimes and document the size budget

- Status: Proposed
- Date: 2026-10-23
- Deciders: Maintainer
- Supersedes: —

## Context

The product promises zero-setup, offline practice in Python and TypeScript.
Relying on the user's installed Python/Node introduces version drift, missing
interpreters, broken PATHs, and differences between machines. Bundling runtimes
increases installer size and update complexity. The installer budget is under
350 MB.

## Decision (proposed)

Bundle pinned, platform/arch-specific Python (`python-build-standalone`) and
Node runtimes with the app. Record versions and checksums in `runtimes.json`,
include license files, and expose a `doctor` command plus a repair flow for
missing or corrupt runtimes. TypeScript is transpiled with `sucrase` or
`esbuild`; no type checking happens in the judge.

The final decision depends on the Phase 1 measurements: installer size, cold
start, judge overhead, and packaging complexity on macOS and Windows. If the
budget cannot be met, fall back to first-use language packs downloaded on
demand, with a clear offline limitation.

## Consequences

Positive:

- Predictable behavior and no user setup.
- Works offline immediately after install.
- Judge behavior is reproducible across machines.

Negative:

- Larger installers and more release artifacts.
- Runtime checksums, licenses, and repair flows must be maintained.
- Security updates require shipping a new runtime pack.
- Windows arm64 is out of scope for the MVP.

## Alternatives considered

- **Use system runtimes:** Smaller app, but fragile and violates zero-setup.
- **Download on first use:** Smaller initial installer, but the first practice
  session requires network unless a pack is preinstalled.
- **Container-based execution:** Strong isolation, but conflicts with the
  no-Docker requirement.

## Follow-up

- Measure in Phase 1 and change the status to Accepted or Superseded.
- Keep the runtime layer behind an interface so a download-based pack manager
  can replace bundled runtimes if needed.

## Phase 1 addendum (2026-10-23)

The spike used system Python and Node and did not bundle runtimes. The unsigned
macOS arm64 installer is 190 MB, leaving roughly 160 MB under the 350 MB
budget. TypeScript execution used Node 24's native type stripping, which is
acceptable for a spike but should not be a production dependency.

Recommendation: keep this ADR **Proposed** through Phase 2. In Phase 3, measure
pinned Python and Node runtime packs; if the installer remains under 350 MB and
cold start remains under 3 s, accept bundling. Otherwise fall back to a
first-use language pack with an explicit offline limitation. Production
TypeScript should use esbuild or sucrase regardless of the runtime decision.

## Phase 3 measurement addendum (2026-10-24)

Measured on macOS arm64 with the current unsigned package:

- Installer: 190.6 MB DMG/ZIP; installed app bundle 482.5 MB.
- Cold start: 2652 ms (budget 3000 ms).
- Judge run: 220 ms for 5 sample tests (~44 ms/test) with system runtimes.
- Pinned runtime packs (compressed):
  - macOS arm64: Python 3.12.15 25.2 MB + Node 24.22.0 53.0 MB = 78.2 MB.
  - Windows x64: Python 3.12.15 46.4 MB + Node 24.22.0 37.7 MB = 84.1 MB.
- Extracted footprint: Python 67 MB; the Node tarball is 199 MB, but only the
  117 MB `node` binary is needed (npm, corepack, headers, and docs can be
  dropped).
- Projected installer: ~269 MB on macOS and ~255 MiB on Windows, under the
  350 MB budget.
- Cold start is unaffected because the judge is spawned lazily. The first judge
  run with the pinned packs took 0.43 s (Python) and 1.71 s (Node first-run
  verification); subsequent tests were 50–80 ms each.

Recommendation: **accept bundling** with a slim runtime layout (Python
`install_only`, Node binary only), `runtimes.json` checksums, license files, and
a verify/repair flow. If a signed Windows installer crosses 350 MB, drop the
Node `lib`/`include` payload first; fall back to first-use packs only if the
budget still cannot be met.

Status remains **Proposed** until the maintainer approves the ~80 MB installer
increase and the P3-F packaging work begins.
