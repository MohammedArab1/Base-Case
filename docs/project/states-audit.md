# Loading, empty, and error states — Phase 9 audit

Last reviewed: 2026-10-27

The goal is that no view shows a blank panel while data is loading, an empty
state explains the next action, and a failure is visible without losing the
rest of the workspace.

## Global

- The workspace shell shows a labelled loading panel while settings and content
  load, and a readable error panel if startup fails.
- `<main>` exposes `aria-busy` while the workspace is loading.
- Page-level error callouts use `role="alert"`, so assistive technology
  announces them when they appear.
- Route-level views load lazily; each has a Suspense fallback with a heading and
  a short explanation.

## Per view

| View            | Loading                                       | Empty                                                           | Error                                                       |
| --------------- | --------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| Today           | Metric placeholders and “Reading…” copy       | Explains the attempt → review loop and keeps Continue visible   | Page-level alert with the IPC error                         |
| Learn library   | “Loading lessons…”                            | “No lessons yet” with pack guidance; “No matches” for filters   | Page-level alert with the content-load error                |
| Lesson          | “Loading lesson…”                             | Missing lesson shows a back action and an explicit error        | Inline alert with a back action                             |
| Lesson AI       | Provider check, then waiting/cancel states    | Off, not configured, and feature-off callouts explain the path  | Inline alert; the written lesson remains fully readable     |
| Coding library  | Shell loading state                           | “No matches” plus filter/search context                         | Alert with the content-load error                           |
| Problem         | “Loading problem…”                            | Draft/attempt empty states in the inspector                     | Alert with a retry path by reopening the problem            |
| Judge results   | Per-test progress and a Cancel action         | Pre-run explanation of Run vs Submit                            | Status-specific alert; compile/runtime details stay visible |
| AI panel        | “Waiting for the provider…”, Cancel available | Disabled/off/not-configured callouts explain how to enable it   | Inline alert; pre-authored hints remain available           |
| History         | “Loading attempts…”                           | Explains how to create the first attempt                        | Inline alert; reopening the tab retries                     |
| Design list     | “Loading scenarios…”                          | “No design scenarios yet” with pack guidance                    | Page-level alert                                            |
| Design scenario | “Loading scenario…”                           | Locked-reference panel explains submission requirement          | Load, submit, and export errors shown separately            |
| Review          | “Loading the review queue…”                   | “Nothing is due” with the next due date when known              | Page-level alert                                            |
| Progress        | “Reading local progress…”                     | Empty pattern, mistake, and recent-attempt sections give action | Page-level alert                                            |
| Settings        | “Loading environment…”                        | Each card describes its empty/default state                     | Top-level alert plus per-action toasts                      |
| Diagnostics     | “Running checks…” with a disabled trigger     | Each check reports `ok`, warning, or failure                    | Report stays visible and copyable after a failed check      |

## Deliberate gaps

- History and the inspector do not have a dedicated Retry button; reopening the
  tab or problem re-runs the query. This is acceptable for local IPC, which
  fails rarely, but add retries if field reports show transient database locks.
- The design canvas has its own Excalidraw loading surface. It is not hidden
  behind a skeleton because the canvas renders progressively and a placeholder
  would obscure the first paint.
- Settings actions use toasts rather than inline validation for provider and
  pack errors. The form retains the user's input so it can be corrected.

## Verification

- Playwright covers onboarding, search-empty, review-empty, the Learn library
  and lesson detail, lesson AI disabled/enabled previews, diagnostics, and the
  expanded content flow.
- The accessibility gate in `apps/desktop/e2e/app.spec.ts` checks the seven main
  views after they finish loading, plus a lesson detail.
- Manual review: navigate every view with the database closed/read-only and
  confirm the alerts remain readable. This is part of the B11 manual pass.
