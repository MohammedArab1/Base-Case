# Wireframes

These are low-fidelity layout decisions for Phase 0/2. They are not final
visual designs. The minimum window is 1024×700.

## Information architecture

```text
Today
Coding
  ├─ Problem list
  └─ Coding workspace
System Design
  ├─ Scenario list
  └─ Design workspace
Review
Progress
Settings
  ├─ General / Editor
  ├─ Runtimes
  ├─ AI
  ├─ Data
  └─ Diagnostics / About
```

Global: command palette (Cmd/Ctrl+K), toast notifications, judge/runtime/AI
status indicator.

## Today

```text
┌──────────────┬──────────────────────────────────────────────────────────┐
│ Base Case    │ Today                              [Offline] [Phase 0]   │
│              ├──────────────────────────────────────────────────────────┤
│ Today      ● │ Review queue                                             │
│ Coding       │ No cards due. Complete an attempt to start a schedule.   │
│ System Design│ [Browse problems]                                        │
│ Review       │                                                          │
│ Progress     │ Continue                                                 │
│ Settings     │ Nothing in progress. Your last problem will appear here. │
│              │                                                          │
│ Local mode   │ Daily goal                                               │
│ No account   │ Set a goal in onboarding.                                │
└──────────────┴──────────────────────────────────────────────────────────┘
```

## Coding list

```text
┌──────────────┬──────────────────────────────────────────────────────────┐
│ Navigation   │ Coding practice                    [Search] [Filters]    │
│              ├──────────────────────────────────────────────────────────┤
│              │ 12 attempted · 7 solved · 3 due                          │
│              │                                                          │
│              │ Pair Sum             Easy    arrays, hash-map   Solved  │
│              │ Window Maximum       Medium  deque, sliding     Due     │
│              │ Graph Paths          Hard    graphs, bfs        New     │
│              │                                                          │
│              │ Empty state: recommended first problem                   │
└──────────────┴──────────────────────────────────────────────────────────┘
```

## Coding workspace

```text
┌──────────────┬────────────────────┬─────────────────────────┬───────────┐
│ Navigation   │ Statement          │ Editor                  │ Inspector │
│              │                    │                         │           │
│              │ Pair Sum           │ 1 class Solution:       │ AI        │
│              │ [Easy] [arrays]    │ 2     def pairSum(...): │ Notes     │
│              │                    │ 3         ...           │ History   │
│              │ Examples           │                         │           │
│              │ Constraints        │ [Python v] [Run] [Submit]│          │
│              │ Hints (1 2 3 4)    │                         │           │
│              ├────────────────────┴─────────────────────────┴───────────┤
│              │ Results: [Samples] [Hidden] [Compile] [Runtime]          │
│              │ Test 2 failed · expected [1,2] · actual [0,2] · 12 ms    │
└──────────────┴──────────────────────────────────────────────────────────┘
```

Panes are resizable; layout is remembered. Keyboard-first.

## System design workspace

```text
┌──────────────┬────────────────────┬─────────────────────────┬───────────┐
│ Navigation   │ Prompt             │ Canvas                  │ Notes /   │
│              │                    │                         │ Rubric    │
│              │ Design a URL       │   [ Excalidraw ]        │           │
│              │ shortener          │                         │ Require-  │
│              │                    │                         │ ments     │
│              │ Functional         │                         │ Est.      │
│              │ Non-functional     │                         │ API       │
│              │ Scale              │                         │ ...       │
│              │ [Timer] [Submit]   │                         │           │
└──────────────┴────────────────────┴─────────────────────────┴───────────┘
```

Canvas autosaves every 1–2 seconds and on blur. Submit reveals the reference
design and rubric comparison.

## Review

```text
┌──────────────┬──────────────────────────────────────────────────────────┐
│ Navigation   │ Review                                    3 due          │
│              ├──────────────────────────────────────────────────────────┤
│              │ [Coding] [Design] [All]                                  │
│              │                                                          │
│              │ Pair Sum · last result wrong answer · tags: boundary     │
│              │   due today · [Start review]                             │
│              │ URL shortener · notes incomplete · due in 2 days         │
│              │                                                          │
│              │ After review: summary + next due date                    │
└──────────────┴──────────────────────────────────────────────────────────┘
```

## Settings

```text
┌──────────────┬──────────────────────────────────────────────────────────┐
│ Navigation   │ Settings                                                 │
│              ├──────────────────────────────────────────────────────────┤
│              │ [General] [Editor] [Runtimes] [AI] [Data] [Diagnostics]  │
│              │                                                          │
│              │ Theme: System / Light / Dark                             │
│              │ Reduced motion: On / Off                                 │
│              │ Editor font / size / keymap                              │
│              │ Runtime versions and repair                              │
│              │ AI provider, base URL, model, key, test, privacy          │
│              │ Backup, export, import, reset                            │
│              │ Self-test, logs, environment                             │
└──────────────┴──────────────────────────────────────────────────────────┘
```

## States

Every screen needs a loading skeleton, an empty state with a next action, an
error state with retry/diagnostics, an offline state (normal, not an error), an
AI-unavailable state, a runtime-missing state, and an invalid-pack state.
