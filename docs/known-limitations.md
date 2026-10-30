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

- The pack has 81 coding problems, 8 design scenarios, and 39 lessons. The
  Grind 75 collection is a curated 75-problem subset of a public study list that
  currently contains more entries; it is not the complete list. Every statement,
  example, hint, and test is original to Base Case. See the collection
  attribution in the app and `content/packs/core/pack.json`.
- Lessons are a curated core curriculum, not an exhaustive encyclopedia. They
  cover every pattern used by the bundled problems and the core topic index of
  the public System Design Primer, but some advanced topics (for example advanced
  graph shortest-path algorithms and concurrent data structures) are not included
  yet.
- The system-design track does not cover object-oriented design interview
  questions such as a parking lot, call center, deck of cards, or chat server
  class model. Those are a separate interview format. The primer's topics marked
  under development (MapReduce, consistent hashing, and scatter-gather) are
  introduced conceptually, without a distributed batch-processing implementation.
- Lesson diagrams are offline ASCII diagrams. They render consistently and
  require no network, but they are not interactive.
- Lesson completion is manual. Reading a lesson does not automatically mark it
  complete, and lessons are not scheduled by FSRS.
- The content has automated validation and passing reference solutions. B4 is
  closed for the alpha via owner waiver; an independent human second-person
  editorial review remains a v1.0 requirement.
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
- Lesson clarification is an extra explanation layer. It can be wrong or
  incomplete even when the lesson is correct; the offline lesson remains the
  source of truth.
- The real-model bug-zoo run is recorded in
  `docs/evals/results-openai-compatible.json`: `deepseek-v4.1-flash`, 59/60
  cases reviewed, 100% explain diagnosis accuracy, 4.9/5 helpfulness, and 0
  leaks. One hint was truncated by the provider and is left unreviewed. The
  review was AI-assisted at the maintainer's request with a spot-check, not an
  independent second-person review.
- Automated exact-label accuracy is not meaningful for the current model because
  it emits more specific `bugType` names than the bug-zoo taxonomy; use the
  human diagnosis ratings.
- There is no local AI conversation history yet. Feedback is stored locally, but
  full transcripts are not. Lesson clarification is a single question/answer,
  not a running chat.
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
- The recorded screenshots and demo GIF predate the Learn library; they are
  still representative of coding, design, review, and AI flows but do not show
  the new sidebar entry or lesson view.

## Process

- Clean-OS installs were not exercised for the alpha. The Windows
  `0.1.0-alpha` installer was installed on physical Windows 11 and passed
  diagnostics 9/9 with Node and Python reported as bundled; macOS was verified on
  the development Mac and through packaging/CI. The owner accepted the clean-OS
  isolation risk for this alpha (B1 closed by waiver). Clean-VM verification
  remains a v1.0 bar.
- The manual Windows installer workflow was run for build `40607714499`; the
  packaged app installed and launched successfully (B2 done).
- The project board, milestones, and labels are intentionally not configured; the repository is kept as a simple public code repository for now (B6 closed by owner decision).
- The name "Base Case" is a working name. Preliminary research found existing
  software/training uses; the owner accepted the name risk for the public
  repository and will rename if a concern is raised (B5). Legal review was not
  commissioned for this non-commercial side project; the owner accepts the risk
  and will remove content if a credible issue arises (B7).
