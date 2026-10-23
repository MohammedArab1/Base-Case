# Install an unsigned build

Phase 1 produces unsigned macOS and Windows artifacts. They are safe to run
locally for development, but the operating system will show a warning because
the app is not code-signed or notarized yet.

Do not disable Gatekeeper or SmartScreen globally. Use the per-app steps below.

## macOS

1. Download and open the `.dmg`.
2. Drag **Base Case** to `Applications`.
3. The first launch from Finder will be blocked. Open **System Settings →
   Privacy & Security**, find the blocked-app notice, and choose **Open
   Anyway**. Alternatively, Control-click the app in Finder, choose **Open**,
   then confirm.
4. If macOS says the app is damaged, verify the download checksum first. If it
   still fails, run:

   ```sh
   xattr -dr com.apple.quarantine "/Applications/Base Case.app"
   ```

   Only do this for a build you trust. The release notes include the SHA-256
   checksums.

The macOS build is arm64 for Apple Silicon. Intel builds are added before the
public alpha.

## Windows

1. Download the `.exe` installer (NSIS) or the `.zip`.
2. Run the installer. SmartScreen may show **Windows protected your PC**.
3. Choose **More info → Run anyway**. Verify the SHA-256 checksum from the
   release notes before running.
4. The assisted installer asks whether to install for the current user or all
   users, and lets you choose the folder. The per-user default is
   `%LOCALAPPDATA%\Programs\Base Case`; choosing the all-users mode or a custom
   folder changes the path and makes uninstall request elevation.
5. Windows 10 21H2+ or Windows 11 x64 is required.

The Phase 1 judge uses the system Python and Node installations. Phase 3 will
bundle pinned runtimes so a clean machine does not need them. Install Python
from python.org with "Add python.exe to PATH" selected; if `python` or `python3`
resolves to the Microsoft Store alias stub, disable those App Execution Aliases
in Windows Settings. The judge now probes candidates and skips a runtime that
fails to run, but Settings → Judge runtimes should show both runtimes as
available before you start a problem.

The uninstaller removes the application files, shortcut, and uninstall entry. It
may leave an empty install folder behind; deleting it manually is safe. User
data under `%APPDATA%\Base Case` is preserved by design.

## Verify a download

```sh
shasum -a 256 Base-Case-*.dmg
shasum -a 256 Base-Case-*.zip
```

On Windows, use `Get-FileHash -Algorithm SHA256 <file>` in PowerShell.

## Reporting install problems

Open a bug report with the OS version, artifact name, checksum, and the exact
warning text. Do not attach API keys or personal files. For security issues,
follow `SECURITY.md`.
