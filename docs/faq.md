# FAQ

## Is an account or network connection required?

No. Base Case has no account system and no cloud backend. Coding practice, the
judge, system design, review scheduling, and content search work offline. Only a
configured cloud AI provider needs a network connection.

## Why does macOS or Windows warn about the app?

The alpha builds are unsigned. macOS Gatekeeper and Windows SmartScreen warn
about any unsigned app. Follow the per-app steps in `install.md`. Do not disable
Gatekeeper or SmartScreen globally.

## Do I need Python or Node installed?

No. Release installers bundle pinned Python 3.12 and Node 24 runtimes. Settings →
Diagnostics reports whether each runtime is `bundled`, `system`, or unavailable.
Development builds may fall back to the host system.

## The judge says a runtime is missing. What now?

Open **Settings → Diagnostics → Run self-test**. If the judge or a runtime fails,
reinstall the current build. For a development checkout, run
`corepack pnpm judge:build` and `corepack pnpm runtimes:fetch`, then restart the
app.

## Why did my correct-looking solution fail a hidden test?

Hidden tests are ordinary inputs and expected outputs; they are not a security
boundary. Common causes are an empty input, a single element, duplicates, a
negative number, or an in-place signature that returns the wrong value. Read the
first failing case, then compare your output with the expected output. If you
believe the test itself is wrong, open a content issue and include the problem
slug, the input, your output, and the expected output.

## Are sample runs counted as attempts?

No. Sample runs are for iteration. A submission creates an attempt, and the
first submission creates a review card. Review-mode runs never auto-grade.

## How does the review schedule work?

Review cards use FSRS. The first submission creates a card; later submissions
update it. You can grade a due card from the Review view. Daily limits for
reviews and new cards are in Settings.

## Can I use the app for system design without a drawing tablet?

Yes. The canvas works with a mouse or trackpad. Notes and the rubric are separate
from the drawing, so you can complete an attempt with text only.

## Is the AI tutor required?

No. AI is off by default and every core feature works without it. When enabled,
the app shows a context preview before anything leaves the machine. Pre-authored
hints and explanations are the primary learning path; the AI panel is labeled
Experimental.

## Which providers work?

The mock provider works offline. The OpenAI-compatible provider works with
OpenAI, local servers such as Ollama, and other compatible endpoints. API keys
are stored with the operating system's secure storage and are never exposed to
the renderer or included in exports.

## Where is my data, and how do I move it?

Data lives in the platform application-data folder shown in Settings → Data and
environment. **Export data** writes a JSON file with attempts, drafts, notes,
review cards, mistake tags, and settings. API keys are excluded. Import merges
the file into the current profile.

## Can I use my own content?

Yes. Content packs can be imported as a ZIP or folder from Settings. Imported
packs are validated, shown with an **Unverified** badge, and can be removed
without deleting attempts. See `authoring/problem-authoring.md` and
`authoring/design-authoring.md`.

## Does the app collect telemetry?

No. There is no telemetry, analytics, crash upload, or account system. Logs and
backups stay on the machine. The diagnostics report is generated locally and is
only shared if you copy it yourself.

## Why is Linux not supported?

The initial release targets macOS and Windows. Linux is explicitly out of scope
for the alpha; see `known-limitations.md`.

## How do I report a security issue?

Follow `SECURITY.md`. Do not open a public issue for sandbox escapes, key
exposure, data loss, or path traversal.
