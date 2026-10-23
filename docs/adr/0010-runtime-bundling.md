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
