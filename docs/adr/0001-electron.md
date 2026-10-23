# ADR-0001: Use Electron for the desktop shell

- Status: Accepted
- Date: 2026-10-23
- Deciders: Maintainer
- Supersedes: —

## Context

The app targets macOS 13+ and Windows 10 21H2+ / 11. It needs a rich editor,
an Excalidraw canvas, local SQLite storage, a long-lived judge subprocess, and
optional AI streaming over HTTP. The maintainer is comfortable with
TypeScript, React, Python, and Go, and is learning desktop packaging.

## Decision

Build the desktop shell with Electron, React, and TypeScript, using
`electron-vite` for development and production bundles and `electron-builder`
for installers. Renderer code has no Node integration and talks to the main
process through a narrow preload API.

## Consequences

Positive:

- Fast UI iteration with the web ecosystem.
- Mature macOS and Windows packaging, signing, and notarization paths.
- CodeMirror, Excalidraw, and React are first-class.
- A large hiring/contribution pool for TypeScript and React.

Negative:

- Larger installers and higher idle memory than native or Tauri.
- Electron security hardening is mandatory: context isolation, sandboxed
  renderer, no remote module, strict CSP, validated IPC.
- Native modules such as SQLite drivers need ABI-compatible builds per
  Electron version.
- Apple hardened-runtime distribution may require JIT entitlements for
  CodeMirror/Excalidraw and the Node runtime.

## Alternatives considered

- **Tauri:** Smaller bundles, but the judge and canvas integration would span
  Rust and TypeScript, and the maintainer would spend more time on the shell
  than on judging and learning features.
- **Wails (Go):** Attractive because the judge is Go, but the React/Electron
  ecosystem and packaging maturity are stronger for this project.
- **Native Swift/C#:** Best platform integration, but doubles UI work and makes
  shared components, tests, and contributions harder.

## Follow-up

- Measure cold start, idle memory, and installer size in the Phase 1 spike.
- Revisit only if the app exceeds the size/memory budgets in `PLAN.md` Section
  11.3 or packaging becomes unworkable.
