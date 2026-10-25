# Screenshots

Captured automatically from the Playwright suite with
`BASE_CASE_PLAYWRIGHT_SCREENSHOTS=docs/assets/screenshots pnpm smoke:playwright`.
The screenshots use a fresh local profile and the mock AI provider; no real
account, network service, or personal data is involved.

## Coding workspace

The inspector can sit beside the statement and editor on wide windows, or stack
below them on narrower ones.

![Coding workspace with the inspector inline](assets/screenshots/inspector-inline.png)

![Coding workspace at a narrower window](assets/screenshots/inspector-stacked.png)

## AI assistance

The AI panel previews the exact context before sending anything. The
explain-back check and user-confirmed mistake tags are shown after a failed
run.

![AI hint and mistake tag suggestions](assets/screenshots/ai-hint.png)

## Expanded content

A linked-list problem from the 25-problem core pack, solved in TypeScript.

![Reverse Chain in the coding workspace](assets/screenshots/linked-list.png)

## Progress and review

The 14-day activity chart, pattern coverage, mistake tags, and review queue are
local SQLite views.

![Progress view with activity chart](assets/screenshots/review-progress.png)

## System design

The design workspace keeps the canvas, structured notes, rubric, and reference
together.

![System design workspace with a revealed reference](assets/screenshots/design-reference.png)

## Diagnostics

The local self-test checks the database, storage, logs, content counts, search
index, judge, runtimes, and AI configuration without contacting the network.

![Diagnostics self-test report](assets/screenshots/diagnostics.png)
