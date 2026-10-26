# Install an unsigned build

The alpha builds are unsigned. They are safe to run locally, but the operating
system will show a warning because the app is not code-signed or notarized yet.

For a guided first run, see `quickstart.md`. After installing, open
**Settings → Diagnostics → Run self-test** to verify the database, content,
judge, and bundled runtimes.

Do not disable Gatekeeper or SmartScreen globally. Use the per-app steps below.

Both installers bundle pinned Python 3.12.15 and Node 24.22.0 runtimes, so a
clean machine does not need either language installed.

## macOS

Release builds are produced for both Apple Silicon (`arm64`) and Intel (`x64`).
The judge and bundled runtimes are built for the same architecture as the app.

- **Apple Silicon (M1/M2/M3/M4):** use the `arm64` DMG.
- **Intel Macs:** use the `x64` DMG.
- A Rosetta installation prompt on an Apple Silicon Mac means you downloaded the
  `x64` build. Close it and download the `arm64` build instead. If you
  deliberately need to run the Intel build, install Rosetta with
  `softwareupdate --install-rosetta --agree-to-license`.

### From a GitHub Actions artifact

The `base-case-macOS` artifact is a ZIP containing both architectures, their
ZIPs, and `SHA256SUMS.txt`.

1. Download and extract the artifact ZIP.
2. Verify the DMG you intend to use:

   ```sh
   shasum -a 256 "Base-Case-0.1.0-alpha-arm64.dmg"
   ```

   Compare the result with the matching line in `SHA256SUMS.txt`.

3. Open the DMG and drag **Base Case** to `Applications`.
4. The first launch is blocked because the build is not notarized. Open
   **System Settings → Privacy & Security**, find the blocked-app notice, and
   choose **Open Anyway**. Alternatively, Control-click the app and choose
   **Open**.

### “Base Case is damaged and can’t be opened”

This usually means macOS quarantined the downloaded app. The build is ad-hoc
signed but not notarized. Only do this for a build you trust:

```sh
xattr -dr com.apple.quarantine "/Applications/Base Case.app"
open "/Applications/Base Case.app"
```

If the warning persists, verify the SHA-256 checksum against
`SHA256SUMS.txt` and download the artifact again. Do not disable Gatekeeper
globally. A “damaged” message from artifacts built before the ad-hoc signing
fix is expected; newer builds have a valid bundle signature.

## Windows

1. Download the `.exe` installer (NSIS) or the `.zip`.
2. Run the installer. SmartScreen may show **Windows protected your PC**.
3. Choose **More info → Run anyway**. Verify the SHA-256 checksum from
   `SHA256SUMS.txt` before running.
4. The assisted installer asks whether to install for the current user or all
   users, and lets you choose the folder. The per-user default is
   `%LOCALAPPDATA%\Programs\Base Case`; choosing the all-users mode or a custom
   folder changes the path and makes uninstall request elevation.
5. Windows 10 21H2+ or Windows 11 x64 is required.

The installer bundles pinned Python and Node runtimes, so a clean machine does
not need either language installed. Settings → Judge runtimes shows `bundled`
for both when the packaged runtimes are healthy. Development builds fall back
to `system` runtimes when the bundled packs are absent; in that case install
Python from python.org with "Add python.exe to PATH" selected. If `python` or
`python3` resolves to the Microsoft Store alias stub, disable those App
Execution Aliases in Windows Settings.

The uninstaller removes the application files, shortcut, and uninstall entry. It
may leave an empty install folder behind; deleting it manually is safe. User
data under `%APPDATA%\Base Case` is preserved by design.

## Verify or repair bundled runtimes

Development builds fetch pinned runtimes into `build/runtime`:

```sh
pnpm runtimes:fetch
pnpm runtimes:verify
```

Use `pnpm runtimes:fetch --force` to re-download and replace a missing or
corrupt pack. The manifest and SHA-256 values live in `runtimes.json`; the
license files are copied next to each runtime.

## Verify a download

Download `SHA256SUMS.txt` from the same release, then compare:

```sh
shasum -a 256 -c SHA256SUMS.txt
```

On Windows, use `Get-FileHash -Algorithm SHA256 <file>` in PowerShell and
compare the output with the matching line in `SHA256SUMS.txt`.

## Reporting install problems

Open a bug report with the OS version, artifact name, checksum, and the exact
warning text. Do not attach API keys or personal files. For security issues,
follow `SECURITY.md`.
