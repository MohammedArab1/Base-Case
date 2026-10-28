# Security review — Phase 9

Last reviewed: 2026-10-25
Commit: `e53187d` (re-run the commands below after any dependency change)
Scope: Electron main/preload/renderer boundary, judge execution, content packs, AI
configuration, and production dependencies.

## Electron checklist

| Control                     | Status | Evidence                                                                                                  |
| --------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| Renderer sandbox            | Pass   | `sandbox: true` in `apps/desktop/src/main/index.ts`.                                                      |
| Context isolation           | Pass   | `contextIsolation: true`; no `nodeIntegration`.                                                           |
| Web security                | Pass   | `webSecurity: true`.                                                                                      |
| Narrow preload API          | Pass   | `contextBridge.exposeInMainWorld('baseCase', api)` exposes typed methods only.                            |
| IPC validation              | Pass   | Every channel is registered with a Zod schema in `main/ipc.ts` and `main/ipc-schemas.ts`.                 |
| Navigation                  | Pass   | `will-navigate` is cancelled; new windows are denied.                                                     |
| External links              | Pass   | Only `https://` URLs are opened with the system browser.                                                  |
| Permissions                 | Pass   | Every renderer permission request is denied.                                                              |
| Content Security Policy     | Pass   | `default-src 'self'`, `object-src 'none'`, `frame-src 'none'`, `base-uri 'none'`, `form-action 'none'`.   |
| Secrets in renderer         | Pass   | API keys stay in main; the renderer receives provider metadata and status only.                           |
| Key storage                 | Pass   | Keys use Electron `safeStorage` when available; the key reference is never exported.                      |
| Logging                     | Pass   | Logs exclude API keys, user code, notes, prompts, and responses; the diagnostics report is redacted.      |
| File dialogs                | Pass   | Pack import and export use native dialogs; user-controlled paths are never interpolated into shell calls. |
| Remote content              | Pass   | Bundled content is local. Imported packs are data files; no native code or custom checker execution.      |
| Lesson content              | Pass   | Lesson Markdown is sanitized and rendered without raw HTML; lesson progress is local SQLite state only.   |
| Lesson AI context           | Pass   | Only the lesson brief, selected section excerpt, and question are sent after an explicit context preview. |
| Auto-update                 | N/A    | No updater in the MVP.                                                                                    |
| Code signing / notarization | N/A    | Unsigned alpha builds are documented; SmartScreen/Gatekeeper caveats are in `install.md`.                 |

## Judge limitations

The judge is a practice tool, not an adversarial execution boundary. See
`docs/architecture/threat-model.md` and `docs/adr/0009-sandbox.md` for the full
model.

- The user's own code is semi-trusted. Imported content is untrusted but is
  validated as data before install.
- macOS uses a Seatbelt profile that denies network, home reads/writes outside
  the workspace, and child process execution. `sandbox-exec` is deprecated and
  may change or disappear in a future macOS release.
- Windows uses Job Objects for process-tree, memory, CPU, and active-process
  limits. Filesystem and network isolation remain best-effort; do not run
  hostile code on Windows.
- Hidden tests are extractable from the app bundle. They are a learning aid, not
  an anti-cheat boundary.
- The judge does not type-check TypeScript; it transpiles and runs it.
- No custom native checkers or multi-file imports are supported in the MVP.

## Dependency audit

Commands:

```sh
pnpm audit --prod
pnpm audit
```

Result on 2026-10-25: **no known production vulnerabilities** after the
following transitive overrides in `pnpm-workspace.yaml`:

- `lodash-es` → `4.18.1`
- `katex` → `0.19.1`
- `nanoid` 3.x → `3.3.20`
- `nanoid` 4.x → `5.1.16`

The overrides affect Excalidraw/Mermaid transitive dependencies. They were
revalidated with `pnpm test`, `pnpm build`, the design Playwright flow, and the
math rendering unit test. Re-run the audit and these checks after any
Excalidraw, Mermaid, KaTeX, or Markdown dependency bump.

Dev-only advisories, if any, do not ship in the packaged app but should still be
reviewed before a release.

## Residual risks

- Unsigned installers trigger Gatekeeper/SmartScreen warnings.
- Clean-OS isolation was waived for the alpha (B1). The Windows installer and
  first-launch flow were verified on hardware (B2); clean-VM verification remains
  a v1.0 bar.
- Manual screen-reader and high-contrast verification remain in
  `docs/project/accessibility.md`.
- Legal review of content, licenses, and AI/privacy disclosures remains B7.
- The app is not suitable for hostile code execution, formal assessment, or
  multi-tenant use.

## Verification

```sh
pnpm audit --prod
pnpm lint && pnpm typecheck && pnpm test
pnpm build && pnpm smoke:e2e
pnpm smoke:playwright
```
