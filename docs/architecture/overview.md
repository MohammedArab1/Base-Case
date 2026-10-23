# Architecture overview

Base Case is a local-first Electron application with a Go judge sidecar. It has
no application backend, no accounts, and no telemetry.

```text
┌──────────────────────────────────────────────────────────────┐
│                        Electron app                          │
│                                                              │
│  ┌────────────────────────┐      ┌────────────────────────┐  │
│  │ Renderer (React/TS)    │      │ Main process (TS)      │  │
│  │                        │ IPC  │                        │  │
│  │  - Coding workspace    │◄────►│  - Content repository  │  │
│  │  - Design workspace    │      │  - SQLite              │  │
│  │  - CodeMirror editor   │      │  - FSRS scheduler      │  │
│  │  - Excalidraw canvas   │      │  - AI provider client  │  │
│  │  - Review/progress UI  │      │  - Judge client        │  │
│  └────────────────────────┘      └───────────┬────────────┘  │
│                                              │ stdio JSONL   │
│                                  ┌───────────▼────────────┐  │
│                                  │ Go judge sidecar       │  │
│                                  │                        │  │
│                                  │  - runtime manager     │  │
│                                  │  - Python/Node harness │  │
│                                  │  - sandbox + limits    │  │
│                                  │  - checkers + results  │  │
│                                  └───────────┬────────────┘  │
│                                              │ spawn         │
│                                  ┌───────────▼────────────┐  │
│                                  │ Python / Node child    │  │
│                                  │ (user code, sandboxed) │  │
│                                  └────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Process responsibilities

### Renderer

- React + TypeScript, bundled locally.
- No Node integration, no filesystem, no process access.
- Communicates through a narrow, typed preload API.
- Renders sanitized Markdown; no raw HTML.
- Owns layout, editor, canvas, and result presentation.

### Electron main

- Owns SQLite, content packs, settings, FSRS state, AI calls, and the judge
  lifecycle.
- Validates every IPC payload (Zod or equivalent).
- Keeps API keys in `safeStorage`; never sends them to the renderer.
- Streams progress events to the renderer.
- Restarts the judge once after a crash, then surfaces a clear error.

### Go judge

- A separate executable, also usable as a CLI.
- Speaks newline-delimited JSON over stdin/stdout.
- Owns compilation/transpilation, execution, limits, sandbox profiles, and
  result comparison.
- Never accesses the network or the user's home directory.
- Receives test input but never expected outputs.

### Language child process

- One fresh process per test.
- Receives only the test input, never the expected output.
- Runs in a per-run temp directory.
- Is killed as a process group on timeout or cancellation.

## Key data flows

### Sample run

1. Renderer sends `judge.run` with problem ID, language, code, and mode
   `sample`.
2. Main loads the problem and sample tests from the content repository.
3. Main sends a request to the judge sidecar.
4. Judge prepares the workspace and runs each test in a fresh child process.
5. Judge returns per-test results; main persists an attempt and sends the
   result to the renderer.
6. If AI is enabled, the renderer can request an explanation using only the
   failing test and relevant code.

### Submit

1. Same flow with mode `submit` and all hidden tests.
2. Correctness tests run first; performance tests run serially with calibrated
   limits.
3. Main persists the attempt, updates FSRS, and records mistake tags.
4. Renderer shows the summary and the first failure.

### Design attempt

1. User reads the prompt and starts a canvas.
2. Canvas JSON and notes autosave to SQLite.
3. User completes a rubric self-assessment.
4. App reveals the reference design and comparison checklist.
5. Main updates the design review card.

### AI request

1. User picks an AI action.
2. Main builds a context pack: problem brief, user plan, relevant code slice,
   smallest failing test, expected/actual, and prior hints.
3. Main shows a preview of exactly what will be sent.
4. On confirmation, main calls the configured provider and streams the response.
5. The response is schema-validated and rendered in the AI panel.

## Failure handling

- **Judge crash:** restart once, then show a clear error; never crash the app.
- **Missing/corrupt runtime:** repair flow with checksums and reinstall.
- **Database corruption:** start from a backup, offer export, never delete data
  silently.
- **AI failure:** show the provider error, keep the pre-authored hint visible,
  and allow retry or disable.
- **Invalid content pack:** reject with readable errors and keep the previous
  pack.
- **Cancellation:** run, submit, and AI calls are cancellable and kill child
  processes.
- **Offline:** no core action blocks on the network.

## Related documents

- `PLAN.md` Sections 3–5 and 10.
- `docs/adr/` for decisions.
- `docs/architecture/judge-protocol.md`.
- `docs/architecture/threat-model.md`.
- `docs/authoring/content-policy.md`.
