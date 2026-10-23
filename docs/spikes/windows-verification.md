# Windows verification — Phase 1 technical spike

This checklist verifies the unsigned Windows build of Base Case on a real Windows
machine. It is written so an AI agent or a human tester can follow it end to end
and produce evidence for the Phase 1 report.

The app is expected to work offline. The Phase 1 judge uses the **system** Python
and Node installations; bundled runtimes are Phase 3 work (ADR-0010). A missing
runtime is an environment problem, not an app defect — but it must be reported.

## Rules

1. Do not disable Defender, SmartScreen, or any system-wide security feature.
   Use per-app "Run anyway" only, and record the exact warning.
2. Never use a real API key or send one anywhere. Use the mock AI provider or the
   dummy key `sk-windows-test-not-real`. Clear it when finished.
3. Do not claim a test passed without the command output or a screenshot.
4. Distinguish **environment problems** (missing Python/Node, locked-down VM,
   SmartScreen) from **app defects**. Report both, separately.
5. Keep the machine online until artifacts and prerequisites are installed,
   then run the offline test deliberately.
6. Do not modify the repository unless asked. Save the report as a new file or
   paste it back to the requester.

## 1. Record the environment

Run in PowerShell:

```powershell
Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsBuildNumber, OsArchitecture
[System.Environment]::OSVersion.Version
Get-CimInstance Win32_ComputerSystem | Select-Object Manufacturer, Model, TotalPhysicalMemory
(Get-Culture).Name
```

Record:

- Windows edition, version, build, architecture (x64 expected).
- Physical machine or VM, and the VM product if applicable.
- RAM, CPU, display resolution, and display scaling (100%, 150%, 200%).
- Whether the account is an administrator.
- Windows Defender / SmartScreen state (enabled is expected).

Supported minimum: Windows 10 21H2+ or Windows 11, x64.

## 2. Verify prerequisites

```powershell
where.exe python
python --version
python -c "print('python-ok')"
where.exe node
node --version
node -e "console.log('node-ok')"
```

Expected: Python 3.12+ and Node 24+.

Important:

- The judge prefers `python` on Windows. If `where.exe python` points at
  `...\WindowsApps\python.exe` and `python --version` opens the Microsoft Store
  or does nothing, that is the Store alias stub. Install Python from
  <https://www.python.org/downloads/windows/> (check "Add python.exe to PATH"),
  or disable the App Execution Aliases for `python.exe`/`python3.exe`, then
  reopen the terminal.
- Node must be a real installation, not a stub. Node 24 is expected because the
  Phase 1 judge relies on Node's TypeScript type stripping.
- For the optional source-level smoke test only: Git, Go 1.27.x, and
  pnpm 12.15.0 via Corepack.

Do not continue to the judge tests until `python -c` and `node -e` both print
successfully. If they cannot be installed on this machine, report **BLOCKED** for
the judge portion and continue with install/UI/persistence checks.

## 3. Download and verify the artifacts

Source: GitHub Actions → **Build installers** → run `40002549825` (or the latest
successful run on `main`) → artifact **base-case-Windows**.

The artifact is a zip containing:

- `Base-Case-0.0.0-x64.exe` — NSIS installer
- `Base-Case-0.0.0-x64.zip` — portable build

Record both filenames, sizes, and SHA-256 hashes:

```powershell
Get-ChildItem .\Base-Case-*-x64.* | Select-Object Name, Length
Get-FileHash -Algorithm SHA256 .\Base-Case-0.0.0-x64.exe
Get-FileHash -Algorithm SHA256 .\Base-Case-0.0.0-x64.zip
```

Expected: the installer is code-signed by nobody (`Get-AuthenticodeSignature`
returns `NotSigned`). SmartScreen is expected on first run.

## 4. Install with the NSIS installer

1. Run `Base-Case-0.0.0-x64.exe`.
2. Record the exact SmartScreen text, if shown. Choose **More info → Run anyway**.
3. Use the default install location, or note the custom path.
4. Confirm the installer completes without an error dialog.

Expected default location: `%LOCALAPPDATA%\Programs\Base Case`.

Verify the bundled resources:

```powershell
$install = Join-Path $env:LOCALAPPDATA 'Programs\Base Case'
Get-ChildItem $install
Test-Path (Join-Path $install 'resources\judge\judge.exe')
Test-Path (Join-Path $install 'resources\content\packs\core\problems\pair-sum\problem.json')
Get-ChildItem (Join-Path $install 'resources\content\packs\core\problems\pair-sum')
Get-Item (Join-Path $install 'resources\app.asar')
```

Expected: `judge.exe`, a `content` directory containing the core pack, and
`app.asar` are present.

Run the bundled judge diagnostics **before** launching the app:

```powershell
& (Join-Path $install 'resources\judge\judge.exe') doctor
```

Expected JSON includes:

```json
{
  "status": "ok",
  "name": "base-case-judge",
  "version": "0.1.0",
  "os": "windows",
  "arch": "amd64",
  "runtimes": {
    "python": { "available": true, "version": "..." },
    "node": { "available": true, "version": "..." }
  }
}
```

Paste the full JSON into the report. If `available` is false, fix the PATH or
report the environment problem.

Note: running `judge.exe` with no arguments starts the JSONL server and appears
to hang. Always pass `doctor`.

## 5. Launch and UI smoke test

Launch **Base Case** from the Start menu shortcut (and later from the installed
`.exe` path).

Record:

- First launch after install: time from double-click to usable UI (stopwatch or
  video frame is fine; be honest that it is approximate).
- Second launch: time again.
- Window title.
- Whether a console window appears (it should not).
- Whether the app shows an error dialog instead of the UI.

Check the UI:

1. Today screen renders.
2. Navigation shows Today, Coding, System Design, Review, Progress, Settings.
3. Click each item; each screen renders without a blank panel or uncaught error.
4. Window can be maximized, restored, minimized, and resized to its minimum.
5. At 100%, 150%, and 200% scaling (if available), text and buttons are not
   clipped.
6. Take screenshots of Today, Coding list, Coding workspace, a results panel,
   System Design canvas, and Settings.

Do not report missing planning-only features as defects. Phase 1 implements the
core loop only. See "Expected limitations" below.

## 6. Judge test matrix

Open **Coding → Core pack → Pair Sum**.

### 6.1 Python accepted

Paste this exact code into the Python editor:

```python
class Solution:
    def pairSum(self, nums, target):
        seen = {}
        for index, value in enumerate(nums):
            complement = target - value
            if complement in seen:
                return [seen[complement], index]
            seen[value] = index
        return []
```

1. Click **Run samples**. Expected: status **Accepted**, `5/5`.
2. Click **Submit**. Expected: status **Accepted**, `39/39`.
3. Record the runtime shown.
4. Press **Ctrl+Enter** in the editor. Expected: it runs samples again (this is
   the only implemented shortcut in the spike).

### 6.2 TypeScript accepted (critical Windows path)

Switch the language selector to TypeScript and paste:

```typescript
class Solution {
  pairSum(nums: number[], target: number): number[] {
    const seen = new Map<number, number>()
    for (let index = 0; index < nums.length; index += 1) {
      const value = nums[index]
      const complement = target - value
      const first = seen.get(complement)
      if (first !== undefined) {
        return [first, index]
      }
      seen.set(value, index)
    }
    return []
  }
}

export { Solution }
```

1. **Run samples** → **Accepted**, `5/5`.
2. **Submit** → **Accepted**, `39/39`.
3. Record the runtime.

This is the most important Windows-specific judge check: it exercises node.exe
resolution, TypeScript type stripping, temp-file paths, and CRLF handling.

### 6.3 Wrong answer

With TypeScript selected, replace the method body with `return []`.

- Expected: status **Wrong answer**.
- Expected: the first-failure panel shows the input, expected output, actual
  output, and per-test chips.
- Screenshot the panel.

### 6.4 Compile error

Switch to Python and remove the colon from the `if` line, for example:

```python
class Solution:
    def pairSum(self, nums, target)
        return []
```

- Expected: status **Compile error**.
- Expected: stderr/line information is visible.
- The app must not crash.

### 6.5 Time limit exceeded

Use an infinite loop:

```python
class Solution:
    def pairSum(self, nums, target):
        while True:
            pass
```

- Expected: status **Time limit exceeded**.
- The effective limit for Python is 6,000 ms (2,000 ms × 3 for the language
  multiplier). It should stop within roughly 6–8 seconds.
- The UI must stay responsive.

### 6.6 Output limit exceeded

```python
class Solution:
    def pairSum(self, nums, target):
        while True:
            print("x" * 1024)
```

- Expected: status **Output limit exceeded** within a few seconds, not a hang.
- The app must remain responsive afterward, and a subsequent normal run must
  succeed.

### 6.7 Process hygiene

After each run above, check for orphaned judge processes:

```powershell
Get-Process judge -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, Path
```

Expected: no `judge` process between runs.

Then:

1. Start the time-limit run again.
2. While it is running, kill the judge:
   ```powershell
   Stop-Process -Name judge -Force
   ```
3. Expected: the app reports a judge error (no silent hang, no crash).
4. Run samples again. Expected: the judge restarts and the run succeeds.
5. Close the app completely. Check `Get-Process` for `judge`, `Base Case`, and
   Electron helper processes. Expected: none remain.

### 6.8 Repeat runs

Alternate Python and TypeScript sample runs 10 times. All must pass. Report any
intermittent failure and the exact run number.

## 7. Persistence, database, and backups

1. In the Python editor, type a unique marker such as
   `# windows-persistence-marker-<timestamp>`.
2. Wait ~2 seconds for autosave.
3. Close the app completely and verify no app/judge processes remain.
4. Relaunch, open Pair Sum, and confirm the marker is still in the editor.
5. Open **Progress**. Attempts from the judge tests must be visible/counted.
6. Check the database and backups:

```powershell
$data = Join-Path $env:APPDATA 'Base Case'
Get-ChildItem $data
Test-Path (Join-Path $data 'app.db')
Get-ChildItem (Join-Path $data 'backups') -Filter *.db | Select-Object Name, Length
python -c "import sqlite3, glob, os; files=[os.path.join(os.environ['APPDATA'],'Base Case','app.db')]+glob.glob(os.path.join(os.environ['APPDATA'],'Base Case','backups','*.db')); [print(f, sqlite3.connect(f).execute('pragma integrity_check').fetchone()[0]) for f in files]"
```

Expected:

- `app.db` exists.
- At least one verified backup exists; the app keeps the newest 7.
- Every `integrity_check` prints `ok`.
- No plaintext API key in any file under `%APPDATA%\Base Case`.

7. In Settings, change an available setting (for example the AI provider to
   Mock), restart, and confirm it persisted.

## 8. System design canvas

1. Open **System Design → Canvas sandbox**.
2. Confirm the Excalidraw canvas renders (no blank area, no error).
3. Draw a rectangle, add text, and draw an arrow.
4. Wait ~2 seconds for autosave.
5. Close the app, relaunch, reopen the design view.
6. Expected: the scene is restored.
7. Use **Export PNG** (or the equivalent control) to open the native Windows save
   dialog. Save to the Desktop.
8. Verify the PNG exists, opens, is not blank, and has sensible dimensions.
9. Record the dialog behavior: native Windows dialog, default filename, extension
   handling.

## 9. AI behavior (optional, no real key)

1. Settings → AI provider → **Mock**.
2. Open the coding workspace, produce a wrong answer, and request an
   explanation. Expected: streamed text appears; the app stays responsive.
3. Switch the provider to an OpenAI-compatible provider and save the dummy key
   `sk-windows-test-not-real` with any base URL. Do not send a request to a real
   service.
4. Close and relaunch. Expected: the configuration persists and the key is shown
   as stored (not lost).
5. Verify the key is not stored in plaintext:

```powershell
Select-String -Path (Join-Path $env:APPDATA 'Base Case\app.db') -Pattern 'sk-windows-test-not-real' -SimpleMatch
Get-ChildItem (Join-Path $env:APPDATA 'Base Case') -Recurse -File |
  Select-String -Pattern 'sk-windows-test-not-real' -SimpleMatch
```

Expected: no matches. `safeStorage` uses DPAPI on Windows; if key storage is
unavailable, report that explicitly.

6. Clear the key and set the provider back to **None**.

## 10. Portable zip

1. Extract `Base-Case-0.0.0-x64.zip` to a directory with spaces, for example:
   `C:\Users\<user>\Desktop\Base Case Test\`.
2. If Windows marks the files as blocked, record it and unblock per-file
   (Properties → Unblock). Do not disable SmartScreen globally.
3. Run `Base Case.exe`.
4. Expected: the app launches, content loads, and a Python and TypeScript sample
   run both pass. This verifies `process.resourcesPath` resolution outside an
   installer.
5. If the account name contains non-ASCII characters, record whether the app and
   judge still work.

## 11. Offline test

1. Disable the network adapter or turn off Wi-Fi.
2. Relaunch the app and run Python + TypeScript samples.
3. Expected: both work; no network calls are required.
4. Open the AI panel with the mock provider. Expected: it works offline.
5. Try a real provider if configured. Expected: a clear error, not a hang or
   crash.
6. Re-enable the network.

## 12. Performance measurements

Record:

- Installer size and installed size.
- First launch and warm launch times.
- Python sample run and submit times.
- TypeScript sample run and submit times.
- Idle memory after 60 seconds:

```powershell
Get-Process | Where-Object { $_.ProcessName -like '*Base Case*' -or $_.ProcessName -eq 'judge' } |
  Select-Object Id, ProcessName, WorkingSet64
```

Sum the working set of the app's process tree and state that it is a rough
number.

## 13. Uninstall

1. Settings → Apps → Installed apps → **Base Case** → Uninstall.
2. Verify the install directory and Start menu shortcut are removed.
3. Record whether `%APPDATA%\Base Case` remains (preserving user data is
   acceptable; report it).
4. Optionally reinstall and confirm the app still launches.

## 14. Optional source-level smoke test

Use this only if Git, Go, and pnpm are available. It exercises the app from
`apps/desktop/out`, not from the installer, and is a stronger regression check
than manual clicking.

```powershell
git clone https://github.com/MohammedArab1/Base-Case.git
cd Base-Case
corepack enable
corepack prepare pnpm@12.15.0 --activate
pnpm install --frozen-lockfile
pnpm judge:build
pnpm build
pnpm smoke:e2e
```

Expected summary:

```json
{
  "problems": 1,
  "sample": "5/5 accepted",
  "submit": "39/39 accepted",
  "wrongAnswer": "wrong_answer",
  "draft": true,
  "scene": true,
  "keyStorage": "stored",
  "attempts": 3,
  "backups": 1
}
```

Also run the Go tests if Go is installed:

```powershell
go test -C services/judge ./...
```

If either fails, paste the full failing output and the assertion message. Do not
change the source to make it pass.

## 15. Expected limitations (do not report as defects)

- The build is unsigned: SmartScreen warnings are expected.
- The app needs system Python and Node. Bundled/transpiled runtimes are Phase 3.
- `memoryBytes` may be `0` or unavailable; memory sampling is Phase 3.
- Only **Ctrl+Enter** is implemented. The other shortcuts in `PLAN.md` §9.4 are
  Phase 4 work.
- No auto-update, code signing, Linux support, accounts, cloud sync, or
  telemetry.
- AI is optional and BYO-key; the mock provider is the supported offline path.
- The system design module is a canvas spike, not the final editor.

## 16. Report template

Return the report in this shape:

```markdown
# Base Case — Windows verification report

- Date:
- Tester:
- Verdict: PASS / PASS WITH ISSUES / FAIL / BLOCKED

## Environment

- Windows edition/build:
- Architecture:
- VM or physical:
- RAM / CPU / display scaling:
- Admin account:
- Python (`where`, version):
- Node (`where`, version):
- Installer SmartScreen text:

## Artifacts

| File                    | Size | SHA-256 |
| ----------------------- | ---- | ------- |
| Base-Case-0.0.0-x64.exe |      |         |
| Base-Case-0.0.0-x64.zip |      |         |

## Install

- Install path:
- Bundled judge present:
- Bundled content present:
- Judge doctor JSON:

## Test matrix

| #   | Test               | Expected                 | Actual | Result    | Evidence   |
| --- | ------------------ | ------------------------ | ------ | --------- | ---------- |
| 1   | Launch             | UI usable                |        | PASS/FAIL | screenshot |
| 2   | Python samples     | 5/5 accepted             |        |           |            |
| 3   | Python submit      | 39/39 accepted           |        |           |            |
| 4   | TypeScript samples | 5/5 accepted             |        |           |            |
| 5   | TypeScript submit  | 39/39 accepted           |        |           |            |
| 6   | Wrong answer       | wrong_answer + panel     |        |           |            |
| 7   | Compile error      | compile_error            |        |           |            |
| 8   | Time limit         | time_limit_exceeded ~6 s |        |           |            |
| 9   | Output limit       | output_limit_exceeded    |        |           |            |
| 10  | No orphan judge    | no judge process         |        |           |            |
| 11  | Judge recovery     | restarts after kill      |        |           |            |
| 12  | Draft persistence  | marker restored          |        |           |            |
| 13  | DB integrity       | ok                       |        |           |            |
| 14  | Backup             | at least 1, <= 7         |        |           |            |
| 15  | Canvas restore     | scene restored           |        |           |            |
| 16  | PNG export         | valid image              |        |           |            |
| 17  | Mock AI            | streams text             |        |           |            |
| 18  | Key storage        | persists, not plaintext  |        |           |            |
| 19  | Portable zip       | launches + judge works   |        |           |            |
| 20  | Offline            | runs without network     |        |           |            |
| 21  | Uninstall          | clean removal            |        |           |            |

## Performance

| Metric                     | Value |
| -------------------------- | ----- |
| Installer size             |       |
| Installed size             |       |
| First launch               |       |
| Warm launch                |       |
| Python sample / submit     |       |
| TypeScript sample / submit |       |
| Idle working set           |       |

## Defects

For each: severity (blocker/major/minor), title, steps, expected, actual,
screenshot/log, suspected area (installer, IPC, judge, renderer, persistence,
AI, canvas).

## Not tested

List anything skipped and why.

## Windows-specific notes

Anything that differs from macOS or may need a code change.
```

## 17. Phase 1 pass criteria

Phase 1 Windows verification passes when:

- The NSIS installer installs and the app launches.
- Bundled `judge.exe` and `content/` are present and `judge doctor` reports both
  runtimes available.
- Python and TypeScript sample and hidden tests pass.
- Wrong answer, compile error, time limit, and output limit behave correctly.
- The UI remains responsive and no orphan judge processes remain.
- Drafts and the design scene persist across a restart.
- `app.db` passes `integrity_check` and a verified backup exists.
- The portable zip also launches and runs the judge.
- Uninstall removes the application files and shortcut.
- The report includes evidence for every row.

A failure is not automatically a Phase 1 blocker. Classify environment issues
separately from product defects, and mark blocker defects explicitly.
