# Phase 1 technical spike report

- Date: 2026-10-23
- Status: macOS complete; Windows verified on hardware; clean-OS isolation waived for the alpha (B1)
- Decision: **Go** for Phase 2, with judge hardening continuing in Phase 3
- Environment: macOS 27.2 (arm64), Node 24.22.0, pnpm 12.15.0, Go 1.27.2,
  Electron 45.0.0, electron-builder 26.15.3; Windows 11 Pro (build 26200, x64),
  Python 3.12.10, Node 25.8.1

## What was proven

### Electron shell

- Secure Electron + React + TypeScript + Vite (`electron-vite`) shell.
- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
- Navigation blocked; external links open in the system browser; permission
  requests denied.
- Narrow preload API; no raw `ipcRenderer` exposed.
- Per-mode CSP: `script-src 'self'` in production; the dev server alone permits
  inline scripts for React refresh.
- Lazy-loaded Coding, Design, and Settings views so Excalidraw and CodeMirror
  do not affect the initial workspace load.
- Unsigned macOS arm64 `.dmg` and `.zip` build successfully.

### Go judge

- JSONL protocol with `hello`, `version`, `doctor`, `ping`, `run`, and
  `shutdown`.
- Real execution for Python and TypeScript function signatures.
- Generated harnesses:
  - Python imports the user module, reads JSON input, calls the method, tees
    stdout/stderr, and returns a structured result.
  - TypeScript uses Node's type stripping for the spike, imports the user
    module, and returns the same structure.
- Expected outputs never enter the child process; the judge compares results.
- Per-test temp workspace, sanitized environment, wall-clock timeout, 1 MiB
  stdout/stderr cap, and process-group kill on timeout/overflow.
- Checkers: `exact`, `unordered`, `float`, `set-of-sets`.
- Statuses exercised: `accepted`, `wrong_answer`, `compile_error`,
  `runtime_error`, `time_limit_exceeded`, `output_limit_exceeded`.
- Cross-compiles for Windows amd64 (`GOOS=windows go build ./...` and `go vet`).
- Runtime discovery probes candidates and skips a broken Microsoft Store
  `python3` alias; `doctor` reports `available: false` when the probe fails.
- Windows runs place each runtime child in a kill-on-close Job Object, so the
  process tree dies even if the judge sidecar is killed.

### Editor and canvas

- CodeMirror 6 with Python and TypeScript modes, dark theme, line numbers,
  history, and autosave to SQLite.
- Markdown statement rendering with GFM and sanitization.
- Progressive hints with an explicit confirmation for level 4.
- Excalidraw embedded in the design workspace; scene JSON autosaves to SQLite
  and restores on reload.
- PNG export is implemented (`exportToBlob` → main-process save dialog). The
  native save dialog was not automated in the smoke test; manually verify
  before Phase 5.

### Database and content

- `node:sqlite` works in Electron 45; no native module rebuild was needed.
- Hand-written migration 1 creates settings, attempts, drafts, design scenes,
  and AI provider tables.
- WAL mode enabled; startup backup uses `VACUUM INTO`, verifies
  `PRAGMA integrity_check`, and keeps the last seven copies.
- The core pack is validated with the same schema as the content CLI.
- One original problem (`core/pair-sum`) loads with statement, hints, 5 sample
  tests, 39 hidden tests, and Python/TypeScript reference solutions.
- Attempts, drafts, and design scenes persist across app restarts.

### AI

- Provider settings for none, mock, and OpenAI-compatible endpoints.
- API key encryption uses Electron 45's async `safeStorage` APIs; keys never
  enter the renderer and are never logged.
- Context preview shows the exact system/user messages before sending.
- Mock provider streams a canned Socratic hint.
- The OpenAI-compatible client was exercised against a local SSE server with
  real streaming parsing. A commercial provider was not called (no key).
- Hidden tests beyond the first failure are not included in the context.

## Measurements

Measured with `scripts/measure-packaged.mjs` on the unsigned macOS arm64 build.

| Metric                       | First launch | Second launch |           Budget |
| ---------------------------- | -----------: | ------------: | ---------------: |
| Cold start to rendered shell |     2,485 ms |        451 ms |       < 3,000 ms |
| Bundled content load         |        13 ms |          1 ms |         < 200 ms |
| Judge run, 5 sample tests    |       268 ms |        151 ms | < 1 s + overhead |
| Judge overhead per test      |       ~54 ms |        ~30 ms |         < 100 ms |
| Idle memory (process tree)   |     264.7 MB |      258.5 MB |         < 500 MB |
| Main process RSS             |     186.6 MB |      183.8 MB |                — |
| Helper processes             |            4 |             4 |                — |
| App bundle                   |     494.9 MB |      494.9 MB |                — |
| DMG                          |       190 MB |        190 MB |         < 350 MB |
| ZIP                          |     190.1 MB |      190.1 MB |         < 350 MB |

Renderer build:

| Asset                           |     Size | Load      |
| ------------------------------- | -------: | --------- |
| Initial JS                      | 582.8 kB | Startup   |
| Initial CSS                     |  20.1 kB | Startup   |
| Coding view (CodeMirror)        |  1.63 MB | On demand |
| Design view (Excalidraw)        |  1.67 MB | On demand |
| Excalidraw/Mermaid shared chunk |  1.84 MB | On demand |
| Main process bundle             |   305 kB | Startup   |

The renderer is large because Excalidraw pulls Mermaid. Lazy loading keeps it
out of the initial coding path. Phase 5 should evaluate trimming Mermaid or
loading Excalidraw in a worker if startup or memory regresses.

Windows verification (unsigned NSIS and portable ZIP, commit `79bc5f7`):

| Metric                          |                 Value |
| ------------------------------- | --------------------: |
| Installer                       |             171.1 MiB |
| Portable ZIP                    |             220.1 MiB |
| Installed size                  |             583.6 MiB |
| Warm launch to CDP              |            563–590 ms |
| Python sample / submit          |     257 ms / 2,070 ms |
| TypeScript sample / submit      |     490 ms / 3,302 ms |
| Submit with an infinite loop    | 6,226 ms → time limit |
| Idle working set (process tree) |              428.4 MB |

The Windows idle memory includes four Electron processes plus the judge; it is
under the 500 MB budget. The installer is smaller than macOS because the
Windows NSIS build compresses the application more aggressively.

## Decisions and changes

- **SQLite driver:** `node:sqlite` works and avoids native rebuilds. Adopt it
  provisionally for Phase 2; keep the repository boundary so a driver swap is
  possible if the experimental API changes.
- **TypeScript execution:** Node 24 type stripping is sufficient for the spike.
  Production should transpile explicitly with esbuild or sucrase so the judge
  does not depend on the host Node version.
- **Runtimes:** The spike used system Python and Node. The 190 MB installer
  leaves about 160 MB of headroom under the 350 MB budget for pinned runtimes.
  Keep ADR-0010 proposed and decide in Phase 3 after measuring bundled runtime
  size.
- **Lazy loading:** Excalidraw and CodeMirror are route-level lazy imports. Keep
  this split.
- **AI transport:** The streaming SSE parser works against a local endpoint.
  Keep the provider abstraction and add provider-specific evals in Phase 6.
- **Process control:** POSIX process-group kill and Windows kill-on-close Job
  Objects both work. The Windows build was exercised on a physical Windows 11
  machine, including runtime selection, judge-kill cleanup, and recovery.
- **Installer mode:** The NSIS assisted installer now produced a per-user
  install at `%LOCALAPPDATA%\Programs\Base Case` with a per-user shortcut and
  `/currentuser` uninstall entry (no UAC).

## Known gaps and blockers

1. **Clean-VM install:** The macOS package was launched on the development
   machine and the Windows package on a physical test machine, not a clean VM.
   Complete this before exiting Phase 1.
2. **Sandbox strength:** The spike has temp dirs, sanitized env, timeout,
   output cap, process-group kill on POSIX, and kill-on-close Job Objects on
   Windows. Seatbelt remains Phase 3.
3. **Memory limits:** Node gets `--max-old-space-size`; Python has no hard
   memory cap yet. `peakMemoryBytes` is always zero in the spike. Phase 3 adds
   sampling and enforcement.
4. **Explicit in-flight cancellation:** The sidecar shuts down cleanly and
   timeouts kill the process group, but there is no concurrent `cancel` request
   while a run is in progress. Phase 3 adds request concurrency and cancel.
5. **PNG export:** Code path exists; native save dialog was verified manually on
   Windows but is not automated.
6. **Real provider call:** Local SSE exercised the client; a real
   OpenAI-compatible provider still needs a manual smoke with a user key.
7. **Content count:** One original problem; alpha needs 10 coding + 4 design.
8. **Hidden tests:** They are present in the content pack and extractable. This
   is a documented limitation, not a security boundary.
9. **Uninstaller leftover:** The NSIS uninstaller may leave an empty install
   folder. Files, shortcuts, and registry entries are removed.

## Demo script

1. `pnpm install && pnpm judge:build && pnpm dev`.
2. Open **Coding**, select **Pair Sum**.
3. Run samples with the starter code → wrong answer with input/expected/actual.
4. Replace the code with a one-pass hash-map solution → accepted.
5. Submit → 39/39 accepted.
6. Reveal hints level 1–4; level 4 requires confirmation.
7. Trigger a failure and choose **Explain failure**; inspect the context
   preview, then stream a mock or local OpenAI-compatible hint.
8. Open **System Design**, draw, wait for “Saved locally”, reload the app, and
   confirm the scene restores. Export PNG.
9. Open **Settings**; verify Python/Node status, configure a mock provider, and
   confirm no key is shown.
10. `pnpm smoke:e2e` runs this path automatically through CDP.

## Go/no-go

**Go.** The riskiest assumptions are validated on macOS and Windows: secure
Electron shell, real multi-language judge, local persistence, canvas
persistence, optional AI streaming, and unsigned packaging. Installer size
(190 MB macOS, 171 MB Windows) and idle memory (~265 MB macOS, ~428 MB Windows)
are within budget. No unknown blocker prevents Phase 2.

### 2026-10-27 update

The Windows `0.1.0-alpha` installer was installed on physical Windows 11 and
launched successfully. Diagnostics passed 9/9 with 79 coding problems and 8
design scenarios; Node 24.22.0 and Python 3.12.15 were both reported as bundled,
and Pair Sum samples passed in both languages. The owner waived clean-OS
isolation for the alpha because no clean macOS VM was available. Clean-VM
verification remains a v1.0 bar.

Phase 1 remains incomplete for v1.0 until clean-VM installs are recorded for
both operating systems. That is an environment/access blocker, not a design
blocker; the alpha proceeds with the explicit waiver above.

## Recommended next steps

1. Clean-VM installs remain a v1.0 bar; the alpha has an owner waiver (B1) and the Windows installer was verified on hardware (B2).
2. Start Phase 2: typed IPC envelopes, structured logging, design system,
   repository layer, FTS5, settings, and Playwright smoke tests.
3. Carry these into Phase 3: runtime bundling decision, Seatbelt, memory
   sampling, explicit cancellation, and esbuild/sucrase transpilation.
