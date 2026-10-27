# Known limitations

These are intentional limits of the alpha, not promises about v1.0. Items that
need work outside this repository are tracked in `project/open-blockers.md`.

## Platform and packaging

- macOS builds are produced for arm64 and x64. Use the artifact that matches
  the Mac; x64 on Apple Silicon requires Rosetta.
- Windows 10 21H2+ and Windows 11 x64 are supported. Linux is out of scope.
- macOS builds are ad-hoc signed but not notarized. Gatekeeper requires per-app
  **Open Anyway** approval on first launch and may show “Apple could not verify
  … free of malware.” Windows SmartScreen warnings are also expected. Follow
  `install.md`; Developer ID signing and notarization are tracked as B12.
- Automatic updates are not implemented. Install a newer build over the old one.

## Judge and sandbox

- The judge is a local practice judge, not a hostile-code sandbox. macOS uses a
  Seatbelt profile; Windows uses Job Object limits. Filesystem and network
  isolation on Windows remain best-effort.
- Hidden tests are ordinary data on disk, not a security boundary. A determined
  local user can find them.
- Only function-style signatures are supported. Class-based, interactive, and
  multi-file problems are out of scope.
- Supported types are the documented primitives, arrays, `ListNode`, `TreeNode`,
  and `void`. Other types fail validation.
- Memory limits are enforced by the runtime and the operating system; reported
  usage can differ slightly between platforms.
- Python and TypeScript are the only judge languages. Java, Go, C++, and Rust are
  not supported.

## Content

- The pack has 79 coding problems and 8 design scenarios. The Grind 75
  collection is a curated 75-problem subset of a public study list that currently
  contains more entries; it is not the complete list. Every statement, example,
  hint, and test is original to Base Case. See the collection attribution in the
  app and `content/packs/core/pack.json`.
- The content has automated validation and passing reference solutions, but the
  second-person editorial review is still pending (B4).
- The eight design scenarios do not yet ship reference Excalidraw scenes. The
  reference design is Markdown; the canvas starts empty (B8).
- Design feedback is a self-assessed rubric. There is no automatic diagram
  grading.
- Imported packs are shown as **Unverified** unless they come from the bundled
  pack. Removal preserves attempts, but there is no pack update flow yet.

## AI

- AI is optional, off by default, and labeled Experimental.
- Only the mock provider and OpenAI-compatible endpoints are supported. Provider
  behavior, latency, and quality vary.
- The bug-zoo evaluation is recorded against the mock provider. A real-model run
  with human ratings is still pending (B3).
- There is no local AI conversation history yet. Feedback is stored locally, but
  full transcripts are not.
- The Apple Foundation Models sidecar is a stretch goal and is not implemented
  (B9).

## Data and sync

- There is no cloud sync, account, or multi-device merge. Export/import is the
  transfer mechanism.
- Import merges into the current profile; it is not a full backup restore.
- Backups are created at startup and the last seven verified copies are kept.
  There is no in-app restore UI yet; restore manually from the `backups/` folder
  while the app is closed.
- Deleting a problem pack preserves attempts by design, so old attempts may refer
  to content that is no longer installed.

## UI and accessibility

- The alpha is keyboard-friendly but has not had a full screen-reader or
  high-contrast audit.
- The command palette and global shortcuts cover navigation and common actions,
  not every control.
- The interface is English-only.
- Very large design scenes and very long problem statements have not been stress
  tested on low-memory machines.

## Process

- Clean-VM installs on macOS and Windows are not yet recorded (B1). The Windows
  build was verified on a physical Windows 11 machine; macOS on the development
  machine.
- The manual Windows installer workflow has not been run from the GitHub Actions
  UI yet (B2).
- The project board, milestones, and labels are not configured (B6).
- The name "Base Case" is a working name; trademark and domain checks are pending
  (B5). Legal review is required before any commercial launch (B7).
