# Content

Content is data, not executable code. A pack contains problems, design scenarios, tests, hints, reference solutions, and attribution.

## Layout

```
content/packs/<pack-id>/
├─ pack.json
├─ problems/<slug>/
│  ├─ problem.json
│  ├─ statement.md
│  ├─ hints.json
│  ├─ explanation.md
│  ├─ solutions/python.py
│  ├─ solutions/typescript.ts
│  └─ tests/sample.jsonl
│     tests/hidden.jsonl
└─ designs/<slug>/
   ├─ design.json
   ├─ prompt.md
   ├─ rubric.json
   ├─ reference.md
   └─ reference.excalidraw.json
```

## Rules

- Original content only. Do not copy statements, examples, constraints, or tests from another judge.
- Every test line is one JSON object with `input` and `expected`.
- Every reference solution must pass every test.
- Tests must be deterministic and independent.
- Attribute adapted content and include its license.
- No executable plugins, native code, or custom checkers in content packs.

See `docs/authoring/` for the full authoring and review process. Run:

```sh
pnpm content:validate
```
