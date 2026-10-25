# Privacy and AI

Base Case is local-first. This document describes exactly what stays on the
machine, what can leave it, and how to remove it.

## What the app stores locally

All of the following live in the platform application-data folder shown in
Settings → Data and environment:

- The SQLite database: attempts, drafts, notes, review cards and history,
  mistake tags, design scenes, settings, and AI feedback.
- Design scene JSON and any PNG you export.
- Logs in `logs/app.log`.
- Up to seven verified database backups in `backups/`.
- Content packs you import.

The app does not create an account, does not include analytics or crash
reporting, and does not send background requests. There is no telemetry.

## What can leave the machine

Only two actions can send data off the machine:

1. **A configured cloud AI provider.** When you enable AI and run a feature, the
   app builds a context from the current problem, code, failing test, and recent
   attempt metadata. The context preview shows the exact text before the request
   is sent. You can copy the preview, cancel, or disable AI entirely.
2. **Opening an external link.** Links open in the system browser. No app data is
   attached.

The judge runs locally. Reference solutions, tests, and attempts are never
uploaded. Local AI endpoints, such as Ollama on `localhost`, keep AI traffic on
the machine.

## API key handling

- Keys are encrypted with Electron `safeStorage`, which uses the operating
  system keychain or credential store.
- The renderer never receives the key. The preload bridge only exposes whether a
  key is stored (`hasKey`).
- Keys are excluded from data export and from the diagnostics report.
- If secure storage is unavailable, the app refuses to save the key rather than
  storing it in plain text.

## AI guardrails

- AI is disabled by default. Six per-feature toggles let you turn off
  explanations, hints, approach review, complexity review, design-note review,
  or the follow-up interviewer independently.
- Requests are rate-limited to eight per minute.
- The context builder enforces a token budget (75% of the configured window) and
  redacts obvious secrets before sending.
- Guardrails remove long code blocks below hint level 4, clamp the reveal level,
  warn when an answer lacks cited evidence, and cap output length.
- AI is disabled in Review mode so it cannot leak an answer during a graded
  review.
- The AI panel is labeled **Experimental**. Pre-authored hints and explanations
  remain the primary path.

## Diagnostics report

**Settings → Diagnostics → Run self-test** checks local components only. The
report contains the app version, platform, paths, counts, and pass/warn/fail
results. It does not contain code, notes, attempt content, prompts, responses, or
API keys. It is only shared if you choose **Copy report**.

## Removing your data

- Delete individual attempts, drafts, notes, and review cards in the app where
  available.
- **Settings → Backup and transfer → Export data** creates a portable copy first.
- To remove everything, quit the app and delete the application-data folder shown
  in Settings. This deletes the database, backups, logs, scenes, and imported
  packs.
- Uninstalling the app does not delete user data by design. Remove the data
  folder separately if you want a clean slate.

## Children and sensitive data

The app is a practice tool, not a formal assessment. Do not enter passwords,
secrets, personal data, or confidential employer material into code, notes, or
AI prompts. The judge is a best-effort sandbox, not a hostile-code boundary; see
`architecture/threat-model.md` and `known-limitations.md`.
