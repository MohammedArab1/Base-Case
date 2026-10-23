# Base Case — Windows verification report

- **Date:** 2026-10-23 (local, `en-CA`)
- **Tester:** Zed coding agent (automated CDP harness on behalf of Mohammed Arab)
- **Artifact tested:** `base-case-Windows`, GitHub Actions run `40002549825` (“Build installers”, success)
- **Artifact commit:** `b18153e57a9e50cbb8d2bec01ed386c4a47ae0e5`
- **Checklist commit:** `c1a4c83` (`docs(spike): add windows verification checklist and fix smoke on windows`)
- **Verdict:** **FAIL** for the tested artifact (`b18153e`). The source at `c1a4c83` passes the full source smoke and contains the Python fix; a rebuild from `c1a4c83` would be **PASS WITH ISSUES** because of the orphan-process and submit-time-limit defects below.

> The artifact is **stale relative to the checklist commit**. The only “Build installers” run on `main` is at `b18153e`; `c1a4c83` is newer and changes exactly the Windows Python runtime selection that failed here. This is a release-process gap, not a defect in the checklist.

## Method and environment caveats

- The UI was driven over the Chrome DevTools Protocol (`--remote-debugging-port`), with real key/mouse/text input events for CodeMirror and Excalidraw. Screenshots are renderer captures from `Page.captureScreenshot`.
- The judge, database, processes, and files were checked with PowerShell/Python outside the app.
- Zed’s sandboxed terminal could not start on this machine (`zed-editor: error while loading shared libraries: libasound.so.2`). All commands ran in the host Git Bash. This is a tooling/environment issue, not a Base Case defect.
- Python 3.11.0 was the only Python initially installed; **Python 3.12.10** was installed per-user during the test. The artifact’s failure was **not** caused by a missing Python: `where.exe python` resolved 3.12 correctly. The artifact prefers the Microsoft Store `python3` alias, which is a stub.

## Environment

- **Windows edition/build:** Windows 11 Pro, version `10.0.26200`, build `26200`, x64.
- **Architecture:** x64.
- **VM or physical:** Physical — Gigabyte X470 AORUS GAMING 5 WIFI.
- **RAM / CPU:** 31.9 GB / AMD Ryzen 7 5700X, 8 cores, 16 logical processors.
- **Display / scaling:** Primary 2048×1152, secondary 1920×1080; **125%** scaling (`devicePixelRatio = 1.25`). 100%/150%/200% were not changed.
- **Admin account:** **No** (`not-elevated`).
- **Culture:** `en-CA`.
- **Defender:** enabled — `AntivirusEnabled=True`, `RealTimeProtectionEnabled=True`, `AntispywareEnabled=True`.
- **Python (`where`, version):**
  - `C:\Users\moham\AppData\Local\Programs\Python\Python312\python.exe` — **Python 3.12.10**
  - (plus Python 3.11.0 at `...\Python311\python.exe`, and the Store aliases)
  - `python -c "print('python-ok')"` → `python-ok`
- **Node (`where`, version):**
  - `C:\Program Files\nodejs\node.exe` — **v25.8.1**
  - `node -e "console.log('node-ok')"` → `node-ok`
- **Other tools:** Go 1.27.2, npm 11.11.0, pnpm 12.15.0 (installed), winget 1.29.380, `gh` 2.x authenticated.
- **Installer SmartScreen text:** **none shown.** The extracted installer had **no Mark-of-the-Web** (the outer artifact zip did), and it was launched with `Start-Process`, which bypasses the shell’s SmartScreen check. Authenticode status is `NotSigned`. This row is therefore **NOT TESTED**, not a pass.

## Artifacts

| File                                          | Size                      | SHA-256                                                            |
| --------------------------------------------- | ------------------------- | ------------------------------------------------------------------ |
| `base-case-Windows.zip` (GitHub artifact zip) | 390.6 MiB (409,621,378 B) | `1a254191383e1da56a3089fbc792f8f45148953193b0dabc96d4d2f546ac7904` |
| `Base-Case-0.0.0-x64.exe` (NSIS)              | 170.9 MiB (179,187,566 B) | `bdad8685335855ce326187a08301746a16a321c3ba8b644bc4afa70a84d09f83` |
| `Base-Case-0.0.0-x64.zip` (portable)          | 219.9 MiB (230,568,060 B) | `0b54da60208f76c27406b9955950ac62ba79f22f971a9693da3ff19526ccbeb2` |

The artifact-zip hash **matches GitHub’s recorded artifact digest** exactly (`sha256:1a254191…`). The installer is **not digitally signed** (`Get-AuthenticodeSignature` → `NotSigned`).

## Install

- **Install path:** `C:\Users\moham\Base Case` — **not** the checklist’s expected `%LOCALAPPDATA%\Programs\Base Case`.
- **Installer:** exit code `0`, ~44.9 s, auto-launched the app. No error dialog.
- **Start menu shortcut:** `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Base Case.lnk` (all-users Start Menu).
- **Uninstall registration:** `HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall` → `Base Case 0.0.0`; `UninstallString` = `"C:\Users\moham\Base Case\Uninstall Base Case.exe" /allusers`. Uninstall required a UAC consent prompt, even though the install path is in the user profile.
- **Bundled resources:** present — `resources\judge\judge.exe`, `resources\content\packs\core\problems\pair-sum\problem.json`, `resources\app.asar`.
- **Installed size:** **583.3 MB** (~556 MiB) of files; uninstaller present.
- **App versions:** Base Case 0.0.0, Electron 45.0.0, embedded Node 24.22.0.

### Bundled `judge doctor` JSON — as installed (normal PATH)

This is the important result: `available` is `true` even though the probe failed.

```json
{
  "arch": "amd64",
  "goVersion": "go1.27.3",
  "name": "base-case-judge",
  "os": "windows",
  "protocolVersion": 1,
  "runtimes": {
    "node": {
      "name": "node",
      "path": "C:\\Program Files\\nodejs\\node.exe",
      "version": "v25.8.1",
      "available": true
    },
    "python": {
      "name": "python",
      "path": "C:\\Users\\moham\\AppData\\Local\\Microsoft\\WindowsApps\\python3.exe",
      "version": "",
      "available": true,
      "error": "exit status 9009"
    }
  },
  "status": "ok",
  "version": "0.1.0"
}
```

### `judge doctor` JSON — WindowsApps alias excluded from PATH

After relaunching with `%LOCALAPPDATA%\Microsoft\WindowsApps` removed from the process PATH (so `python3` no longer resolves), the same bundled binary reports the real runtime:

```json
{
  "arch": "amd64",
  "goVersion": "go1.27.3",
  "name": "base-case-judge",
  "os": "windows",
  "protocolVersion": 1,
  "runtimes": {
    "node": {
      "name": "node",
      "path": "C:\\Program Files\\nodejs\\node.exe",
      "version": "v25.8.1",
      "available": true
    },
    "python": {
      "name": "python",
      "path": "C:\\Users\\moham\\AppData\\Local\\Programs\\Python\\Python312\\python.exe",
      "version": "Python 3.12.10",
      "available": true
    }
  },
  "status": "ok",
  "version": "0.1.0"
}
```

The artifact was built before `c1a4c83`, whose judge change is exactly:

```diff
- pythonPath = firstLookPath("python3", "python")
+ if runtime.GOOS == "windows" {
+   pythonPath = firstLookPath("python", "python3")
+ } else {
+   pythonPath = firstLookPath("python3", "python")
+ }
```

## Test matrix

| #   | Test                      | Expected                                       | Actual                                                                                                                                                                             | Result                                        | Evidence                                                                                                                                                                |
| --- | ------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Launch                    | UI usable                                      | Today screen rendered; no console; Electron 45.0.0                                                                                                                                 | **PASS**                                      | [01-today.png](.windows-verify/screenshots/01-today.png)                                                                                                                |
| 2   | Python samples            | `5/5` accepted                                 | As delivered: **Runtime Error, 0/5**, `499 ms`; STDERR: “Python was not found; run without arguments to install from the Microsoft Store…”. After PATH workaround: **5/5, 227 ms** | **FAIL (as delivered)**; PASS with workaround | [04](.windows-verify/screenshots/04-python-samples.png), [08](.windows-verify/screenshots/08-python-samples.png)                                                        |
| 3   | Python submit             | `39/39` accepted                               | After workaround: **39/39, 1719 ms**. Not possible as delivered (Python path broken).                                                                                              | **PASS (workaround)**                         | [09-python-submit.png](.windows-verify/screenshots/09-python-submit.png)                                                                                                |
| 4   | TypeScript samples        | `5/5` accepted                                 | **5/5, 432 ms**                                                                                                                                                                    | **PASS**                                      | [05-ts-samples.png](.windows-verify/screenshots/05-ts-samples.png)                                                                                                      |
| 5   | TypeScript submit         | `39/39` accepted                               | **39/39, 3032 ms**                                                                                                                                                                 | **PASS**                                      | [06-ts-submit.png](.windows-verify/screenshots/06-ts-submit.png)                                                                                                        |
| 6   | Wrong answer              | `wrong_answer` + first-failure panel           | Wrong Answer, 0/5; input/expected/actual + chips shown                                                                                                                             | **PASS**                                      | [07-ts-wrong-answer.png](.windows-verify/screenshots/07-ts-wrong-answer.png)                                                                                            |
| 7   | Compile error             | `compile_error`, stderr/line visible, no crash | Compile Error, 0/5, 46 ms; `SyntaxError: expected ':'`, line 2                                                                                                                     | **PASS**                                      | [10-python-compile-error.png](.windows-verify/screenshots/10-python-compile-error.png)                                                                                  |
| 8   | Time limit (samples)      | `time_limit_exceeded` ~6 s                     | Status correct, but **30,640 ms** (5 samples × 6 s); UI stayed responsive                                                                                                          | **PASS (status) / FAIL (timing)**             | [11-python-time-limit.png](.windows-verify/screenshots/11-python-time-limit.png)                                                                                        |
| 9   | Output limit              | `output_limit_exceeded`, few seconds           | **937 ms**, 0/5, app responsive; next normal run passed                                                                                                                            | **PASS**                                      | [12-python-output-limit.png](.windows-verify/screenshots/12-python-output-limit.png)                                                                                    |
| 10  | No orphan judge processes | None between runs                              | One `judge.exe` sidecar stays alive while the app is open (by design); after app close: 0. Killing the judge leaves **orphaned `python.exe -I harness.py`** processes.             | **FAIL**                                      | process output below                                                                                                                                                    |
| 11  | Judge recovery            | Error, then restart and pass                   | “Judge sidecar exited (code=4294967295…)” shown; next run restarted and passed 5/5                                                                                                 | **PASS** (orphan caveat)                      | [13-judge-killed.png](.windows-verify/screenshots/13-judge-killed.png)                                                                                                  |
| 12  | Draft persistence         | Marker restored                                | Python marker `# windows-persistence-marker-python-20261023-1910` restored after full close/relaunch                                                                               | **PASS**                                      | [14-progress.png](.windows-verify/screenshots/14-progress.png), DB check                                                                                                |
| 13  | DB integrity              | `ok`                                           | `app.db` and all 7 backups: `ok`                                                                                                                                                   | **PASS**                                      | command output                                                                                                                                                          |
| 14  | Backup                    | ≥1, ≤7                                         | 7 valid `.db` backups (cap reached)                                                                                                                                                | **PASS**                                      | `%APPDATA%\Base Case\backups`                                                                                                                                           |
| 15  | Canvas restore            | Scene restored                                 | Text + arrow + rectangle (3 elements) restored after restart                                                                                                                       | **PASS**                                      | [20](.windows-verify/screenshots/20-canvas-three-elements.png), [21](.windows-verify/screenshots/21-canvas-restored.png)                                                |
| 16  | PNG export                | Valid image                                    | Native dialog “Export design as PNG”; saved `Documents\base-case-design.png`; **440×340**, valid PNG, all 3 elements                                                               | **PASS**                                      | [22-exported.png](.windows-verify/screenshots/22-exported.png)                                                                                                          |
| 17  | Mock AI                   | Streams text                                   | Mock response streamed; context preview 1938 chars; app responsive                                                                                                                 | **PASS**                                      | [23](.windows-verify/screenshots/23-ai-preview.png), [24](.windows-verify/screenshots/24-ai-mock-response.png)                                                          |
| 18  | Key storage               | Persists, not plaintext                        | `hasKey: true` across restart; 0 plaintext matches under `%APPDATA%\Base Case`; key cleared afterwards (`hasKey: false`)                                                           | **PASS**                                      | [25-settings-key-persisted.png](.windows-verify/screenshots/25-settings-key-persisted.png)                                                                              |
| 19  | Portable zip              | Launches + judge works                         | Extracted to `…\Desktop\Base Case Test` (spaces); Python 5/5 (224 ms), TypeScript 5/5 (356 ms); portable `resources\judge\judge.exe` used                                          | **PASS**                                      | [27](.windows-verify/screenshots/27-portable-today.png), [28](.windows-verify/screenshots/28-portable-python.png), [29](.windows-verify/screenshots/29-portable-ts.png) |
| 20  | Offline                   | Runs without network                           | **Per-app simulation** (`--host-resolver-rules="MAP * ~NOTFOUND"` + dead proxy): Python 5/5 (241 ms), TypeScript 5/5 (353 ms), mock AI worked; no external TCP connections         | **PASS (simulated)**                          | [30](.windows-verify/screenshots/30-offline-ts.png), [31](.windows-verify/screenshots/31-offline-mock-ai.png)                                                           |
| 21  | Uninstall                 | Clean removal                                  | Files, Start-menu shortcut, and HKLM entry removed; **empty `C:\Users\moham\Base Case` folder remains**; `%APPDATA%\Base Case` preserved                                           | **PASS (minor leftover)**                     | command output                                                                                                                                                          |
| 22  | Repeat runs               | 10/10                                          | **10/10 PASS**, alternating Python/TypeScript, 214–369 ms                                                                                                                          | **PASS**                                      | `repeat.mjs` output                                                                                                                                                     |
| 23  | Source smoke (`c1a4c83`)  | Expected summary                               | Exact expected summary, `Smoke test passed`                                                                                                                                        | **PASS**                                      | output below                                                                                                                                                            |
| 24  | Go tests                  | All pass                                       | `judge`, `protocol`, `server` all `ok`                                                                                                                                             | **PASS**                                      | output below                                                                                                                                                            |
| 25  | Submit-mode time limit    | `time_limit_exceeded`                          | **“Run failed. Error invoking remote method ‘judge:run’: Error: Judge request timed out after 120000 ms.”** after 119,637 ms; judge kept running 39×6 s                            | **FAIL**                                      | [35-submit-tle-timeout.png](.windows-verify/screenshots/35-submit-tle-timeout.png)                                                                                      |
| 26  | Scaling 100/150/200%      | No clipping                                    | Only native **125%** tested; not changed                                                                                                                                           | **NOT RUN**                                   | —                                                                                                                                                                       |
| 27  | SmartScreen warning       | Record exact text                              | No MOTW on extracted exe; launched via `Start-Process`; no warning surfaced                                                                                                        | **NOT RUN**                                   | —                                                                                                                                                                       |

### Navigation / UI smoke

Today, Coding list, Coding workspace, results panel, System Design, Settings, Review, and Progress all rendered without blank panels or uncaught errors. Review is an intentional Phase 1 placeholder. Window maximize, restore, minimize, and resize to 1024×700 all worked. At the minimum size, the long Python path in Settings is clipped ([32-window-min-size.png](.windows-verify/screenshots/32-window-min-size.png)).

## Performance

| Metric                     | Value                                                                    |
| -------------------------- | ------------------------------------------------------------------------ |
| Installer size             | 170.9 MiB (179,187,566 B)                                                |
| Portable zip size          | 219.9 MiB (230,568,060 B)                                                |
| Installed size             | 583.3 MB (~556 MiB)                                                      |
| First launch               | ~8 s after installer exit (observation only; not precisely instrumented) |
| Warm launch                | 558–675 ms to CDP ready; ~1 s to usable UI                               |
| Python sample / submit     | 214–263 ms / 1719 ms                                                     |
| TypeScript sample / submit | 351–369 ms / 3032 ms                                                     |
| Idle working set (60 s)    | **428.4 MB** total (4 Electron processes + 11.4 MB judge); rough sum     |
| Python sample time limit   | 30,640 ms (5 × 6,000 ms)                                                 |
| Output limit               | 937 ms                                                                   |
| Submit-mode time limit     | 119,637 ms → generic 120 s timeout                                       |

## Defects

### D1 — BLOCKER (artifact `b18153e`): Python judge resolves the Microsoft Store `python3` stub

**Steps**

1. On a machine with the Store App Execution Aliases for `python3.exe` enabled, install the artifact.
2. Open **Coding → Core pack → Pair Sum**, keep **Python**, paste the accepted solution.
3. Click **Run samples**.

**Expected:** Accepted, 5/5.
**Actual:** **Runtime Error, 0/5, 499 ms**; first-failure stderr:
`Python was not found; run without arguments to install from the Microsoft Store, or disable this shortcut from Settings > Apps > Advanced app settings > App execution aliases.`

`judge doctor` reports `available: true` with `path = …\WindowsApps\python3.exe`, empty `version`, and `error: "exit status 9009"`. Removing `%LOCALAPPDATA%\Microsoft\WindowsApps` from the process PATH makes the same binary pass 5/5 and 39/39.

**Suspected area:** `services/judge/internal/judge/runtimes.go` runtime selection.
**Status:** **Fixed at `c1a4c83`** by preferring `python` on Windows. The source smoke at `c1a4c83` passes. The artifact must be rebuilt from `c1a4c83` or newer.
**Evidence:** [04-python-samples.png](.windows-verify/screenshots/04-python-samples.png), [08-python-samples.png](.windows-verify/screenshots/08-python-samples.png), doctor JSON above.

### D2 — MAJOR (all versions): orphaned runtime child processes after judge termination

**Steps**

1. Start a Python infinite-loop sample run.
2. While it is running, `Stop-Process -Name judge -Force`.
3. Observe `python.exe -I harness.py` children.

**Expected:** Killing the judge stops the run and its child processes.
**Actual:** The judge process dies and the app shows an error, but the runtime child survives and spins at 100% CPU. Observed:

```
ProcessId  ParentProcessId  CommandLine
33504      4680             C:\...\Python312\python.exe -I harness.py   CPU 1081.2 s
26248      15884            C:\...\Python312\python.exe -I harness.py   CPU 19.3 s
```

PID 33504 had consumed **1,081 seconds of CPU** since the earlier judge-kill test (about 18 minutes at one core) and was still running. The same can happen when the 120 s client timeout abandons a submit run.

**Expected fix area:** judge process management on Windows — use a Job Object (kill-on-job-close) or explicitly kill the child runtime tree when the sidecar exits, not only on the internal context deadline/output limit.

**Evidence:** PowerShell process output above; no screenshot (process list text is the evidence).

### D3 — MAJOR (all versions): submit-mode time limit reports a generic 120 s timeout

**Steps**

1. Python infinite loop (`while True: pass`).
2. Click **Submit** (39 hidden tests).

**Expected:** `Time limit exceeded` within ~6–8 s (or at least a correct status).
**Actual:** After **119,637 ms**: “Run failed. Error invoking remote method ‘judge:run’: Error: Judge request timed out after 120000 ms.” The judge continues through 39 tests at 6 s each (~234 s) and the client has already given up.

**Suspected area:** `runner.go` continues after non-compile failures; `JudgeClient.run` has a fixed 120 s timeout. Either stop after the first non-compile failure or scale the client timeout to the number of tests.
**Evidence:** [35-submit-tle-timeout.png](.windows-verify/screenshots/35-submit-tle-timeout.png).

### D4 — MAJOR (all versions): `judge doctor` reports a failed runtime as available

**Steps**

1. With the Store `python3` alias present, run `judge.exe doctor`.

**Expected:** `available: false` (or a clear failure), since the probe exits 9009.
**Actual:** `available: true`, `version: ""`, `error: "exit status 9009"`.

**Suspected area:** `runtimes.go` sets `info.Available = true` **before** running the version probe and never clears it on error. This makes Settings/diagnostics misleading and hid D1.
**Evidence:** doctor JSON above.

### D5 — MINOR: canvas save indicator never settles; database written every ~2 s while idle

**Steps**

1. Open **System Design → Canvas sandbox**, draw a shape.
2. Leave the mouse alone for 6+ seconds.

**Expected:** “Saved locally” after the 800 ms debounce.
**Actual:** Indicator stays **“Saving…”** indefinitely. `design_scenes.updated_at` changed `2026-10-23T19:03:59.744Z` → `2026-10-23T19:04:01.754Z` with no input, and continued at ~2 s intervals. The scene itself is persisted correctly.

**Suspected area:** `DesignView` `onChange` debounce being reset continuously by Excalidraw app-state events; consider comparing serialized scene or only reacting to element changes.
**Evidence:** [20-canvas-three-elements.png](.windows-verify/screenshots/20-canvas-three-elements.png); DB timestamps above.

### D6 — MINOR: uninstall leaves an empty install directory

**Steps**

1. Run the registered uninstaller (UAC approved).
2. Check `C:\Users\moham\Base Case`.

**Expected:** Install directory removed.
**Actual:** All files removed, but the empty directory remains. Start-menu shortcut and HKLM uninstall entry are removed; `%APPDATA%\Base Case` is preserved (acceptable).

**Suspected area:** NSIS `RMDir` order/`$INSTDIR` cleanup.

### D7 — MINOR: raw Electron IPC error text is shown to the user

**Steps**

1. Kill `judge.exe` while a run is active.

**Actual:** Results panel shows `Error invoking remote method 'judge:run': Error: Judge sidecar exited (code=4294967295, signal=null)`.

**Expected:** A concise, user-facing “The judge stopped unexpectedly; retrying will restart it.”
**Suspected area:** renderer error handling in `CodingView` / `JudgeClient` error propagation.

### D8 — MINOR: long runtime paths clip at minimum window size

**Steps**

1. Resize the window to its minimum (1024×700 logical).

**Actual:** In Settings, the Python path is cut off at the card’s right edge with no horizontal scrollbar. Buttons and other text are not clipped.
**Evidence:** [32-window-min-size.png](.windows-verify/screenshots/32-window-min-size.png).

### D9 — OBSERVATION (installer configuration): install path and uninstall scope differ from the checklist

- Installed to `%USERPROFILE%\Base Case`, not `%LOCALAPPDATA%\Programs\Base Case`.
- Shortcut in the all-users Start Menu.
- Uninstall entry in HKLM with `/allusers`, and uninstall requires UAC despite the per-user install path.
- `electron-builder.yml` has `nsis.oneClick: false` and `allowToChangeInstallationDirectory: true`; the directory page default appears to be `$PROFILE\Base Case`. If the documented path is a requirement, set `nsis.installDirectory` explicitly.

This did not prevent install, launch, or uninstall, but it is a documentation/consistency issue and caused a UAC prompt for uninstall.

## Source-level smoke test (`c1a4c83`)

Clean clone at `C:\Users\moham\Desktop\Base-Case-Source` (commit `c1a4c83`), pnpm 12.15.0, Node 25.8.1:

```json
{
  "problems": 1,
  "sample": "5/5 accepted",
  "submit": "39/39 accepted",
  "wrongAnswer": "wrong_answer",
  "draft": true,
  "scene": true,
  "aiPreview": 1938,
  "aiStreamChars": 177,
  "compatibleStreamChars": 98,
  "keyStorage": "stored",
  "attempts": 3,
  "backups": 1,
  "judge": "base-case-judge 0.1.0"
}
```

`Smoke test passed`

Go tests:

```
ok  github.com/base-case/base-case/services/judge/internal/judge     1.312s
ok  github.com/base-case/base-case/services/judge/internal/protocol  0.020s
ok  github.com/base-case/base-case/services/judge/internal/server    0.133s
```

This proves the Python fix and the smoke expectations at the required commit. It does **not** exercise the installer, portable zip, or the orphan-process/submit-timeout defects.

## Not tested

- **System-wide offline** — Wi-Fi is the only internet path and also carries the verification session; disabling it would have severed the harness. Offline was simulated per-app (DNS blackhole + dead proxy); no external TCP sockets were observed.
- **SmartScreen warning** — the extracted installer had no Mark-of-the-Web and was launched from the command line. A browser download + Explorer double-click would be needed to see the exact warning.
- **100% / 150% / 200% display scaling** — only native 125% was exercised; changing it requires a session change.
- **Reinstall after uninstall** (optional) and precise first-launch instrumentation.
- **Non-ASCII user-profile paths** — the account path is ASCII.
- **Real AI provider / real API key** — only the mock provider and a localhost OpenAI-compatible endpoint were used; the dummy key was never sent anywhere and was removed.
- **`memoryBytes` sampling** — known Phase 3 limitation.
- **macOS/Linux, auto-update, telemetry, accounts, cloud sync** — out of scope/expected limitations.

## Windows-specific notes

- **Store aliases:** `python3.exe` and `python.exe` in `%LOCALAPPDATA%\Microsoft\WindowsApps` point to `AppInstallerPythonRedirector.exe`. The artifact’s `python3` preference turns a working Python 3.12 install into a runtime error. Prefer `python` on Windows (fixed in `c1a4c83`) and make `doctor` reflect probe failures.
- **Process trees:** Windows has no POSIX process-group kill. The judge must use a Job Object or `taskkill /T` equivalent; otherwise TLE/output-limit/runtime children leak when the sidecar is killed or times out.
- **safeStorage/DPAPI:** key storage works (`hasKey: true` across restarts; no plaintext in `app.db`, WAL, backups, Local Storage, or Preferences).
- **Paths with spaces:** the portable build works from `C:\Users\moham\Desktop\Base Case Test`, and `process.resourcesPath` resolves its own `judge.exe`.
- **TypeScript:** Node 25.8.1 type stripping and CRLF/temp paths work; samples 5/5 and hidden 39/39.
- **Native save dialog:** titled “Export design as PNG”, default filename `base-case-design.png`, default directory `Documents`, `.png` extension handled.
- **UAC:** uninstall is registered all-users and prompts for elevation even though files are under the user profile.

## Evidence index

Screenshots (renderer captures) are in `.windows-verify/screenshots/`:

- `01-today.png`, `02-coding-list.png`, `03-coding-workspace.png`
- `04-python-samples.png` (failure as delivered), `05-ts-samples.png`, `06-ts-submit.png`, `07-ts-wrong-answer.png`
- `08-python-samples.png`, `09-python-submit.png` (after PATH workaround)
- `10-python-compile-error.png`, `11-python-time-limit.png`, `12-python-output-limit.png`
- `13-judge-killed.png`, `14-progress.png`
- `15-settings.png`, `16-settings-persisted.png`
- `17-canvas-initial.png`, `18-canvas-drawn.png`, `19-canvas-saved.png`, `20-canvas-three-elements.png`, `21-canvas-restored.png`, `22-exported.png`
- `23-ai-preview.png`, `24-ai-mock-response.png`, `25-settings-key-persisted.png`, `26-ai-provider-error.png`
- `27-portable-today.png`, `28-portable-python.png`, `29-portable-ts.png`
- `30-offline-ts.png`, `31-offline-mock-ai.png`
- `32-window-min-size.png`, `33-review.png`, `34-today-final.png`
- `35-submit-tle-timeout.png`

Logs/scripts: `.windows-verify/app-err.log`, `app-out.log`, `portable-*.log`, `offline-*.log`, `cdp.mjs`, `repeat.mjs`, `draw.mjs`, `add-rect.mjs`, `launch-*.ps1`, `window*.ps1`.

## Phase 1 pass criteria assessment

| Criterion                                                              | Result                                                                                                                |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| NSIS installs and app launches                                         | PASS (different install path; UAC only for uninstall)                                                                 |
| Bundled judge/content present; doctor both runtimes available          | **FAIL as installed**: Python resolves to the Store stub (fixed at `c1a4c83`); doctor also misreports it as available |
| Python and TypeScript sample/hidden tests pass                         | **FAIL as installed** (Python); PASS with PATH workaround and at source `c1a4c83`                                     |
| Wrong answer, compile error, time limit, output limit behave correctly | PASS except: sample TLE takes 30.6 s; submit TLE returns a generic timeout                                            |
| UI responsive; no orphan judge processes                               | **FAIL**: orphaned runtime children spin after judge termination                                                      |
| Drafts and design scene persist                                        | PASS                                                                                                                  |
| `app.db` integrity and verified backup                                 | PASS                                                                                                                  |
| Portable zip launches and runs judge                                   | PASS                                                                                                                  |
| Uninstall removes files and shortcut                                   | PASS with an empty install directory left                                                                             |

**Bottom line:** The Windows app’s core loop works well, and the TypeScript path — the critical Windows-specific risk — is solid. The artifact must be rebuilt from `c1a4c83` to fix the Python regression. Before Phase 1 sign-off, fix the orphaned runtime process leak and the submit-mode timeout/status handling; these are independent of the Python regression and are present at `c1a4c83`.
