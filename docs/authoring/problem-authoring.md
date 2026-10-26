# Problem authoring guide

## Required files

```
problems/<slug>/
├─ problem.json
├─ statement.md
├─ hints.json
├─ explanation.md
├─ solutions/python.py
├─ solutions/typescript.ts
└─ tests/
   ├─ sample.jsonl
   └─ hidden.jsonl
```

Start from `content/templates/problem/`.

## Statement

Include:

- one-sentence task;
- input/output description;
- 2–4 examples;
- constraints that justify the intended complexity;
- an optional follow-up.

Quality bar:

- A junior developer can understand it without outside context.
- Examples do not give away the optimal approach.
- Constraints justify the intended complexity.
- The statement is original. See `content-policy.md`.

## Signature and limits

- Choose `function` or `design`.
- Use only supported types: primitives, one- and two-dimensional arrays,
  `ListNode`, `TreeNode`, and `void`.
- List mutated parameters in `mutates` for in-place problems.
- Set `timeMs` and `memoryMb`; use language multipliers for slower runtimes.
- Pick a checker: `exact`, `unordered`, `float`, or `set-of-sets`.

For in-place problems, list the changed parameters in `mutates` and use this
expected shape:

```json
{ "returnValue": 5, "mutated": { "nums": [0, 1, 2, 3, 4] } }
```

When the method returns `void`, set `returnValue` to `null`:

```json
{ "returnValue": null, "mutated": { "nums": [1, 2, 3] } }
```

### Node types

`ListNode` and `TreeNode` values cross the boundary as JSON arrays:

- `ListNode`: `[1, 2, 3]` is `1 -> 2 -> 3`.
- `TreeNode`: level-order with `null` for missing children, e.g.
  `[4, 2, 7, 1, 3, 6, 9]`. Trailing `null` entries are trimmed on output.
- `[]` or `null` is an empty list/tree.

The judge provides `ListNode` and `TreeNode` classes to both harnesses and
injects them into the Python solution module, so annotations such as
`head: ListNode` work without an import. Do not rely on `instanceof` across
the harness boundary; access `.val`, `.next`, `.left`, and `.right` instead.

## Tests

One JSON object per line:

```jsonl
{
  "input": {
    "nums": [
      2,
      7,
      11,
      15
    ],
    "target": 9
  },
  "expected": [
    0,
    1
  ]
}
```

Requirements:

- 3–5 sample tests and 15–50 hidden tests.
- Deterministic: random inputs are pre-generated and stored.
- Independent: no test depends on another test's state.
- Every hidden test has an expected output or a checker.
- The smallest failing test is understandable.
- Include empty/single-element inputs, duplicates, negatives, min/max values,
  unicode where relevant, sorted/reverse-sorted inputs, and adversarial cases.
- Performance tests are marked and run serially.
- Validate every expected output with at least two independent solutions.

Tests that depend on hash-map iteration order are invalid.

## Hints

Four levels:

1. Pattern/insight question.
2. Approach.
3. Algorithm outline, no full code.
4. Pseudocode or full solution, only after explicit confirmation.

Never put full code before level 4. Use the same terminology as the statement.

## Explanation

- Start with the key insight.
- Explain why the naive approach fails or is too slow.
- Give the algorithm in steps.
- Include a correctness argument.
- Include time and space complexity.
- List 2–3 common mistakes.
- Link to one related problem or pattern.

## Reference solutions

- Provide Python and TypeScript.
- Ideally provide a brute-force and an optimal solution.
- Every solution must pass every sample and hidden test.
- Do not include debug prints or non-deterministic behavior.
- Keep the class/method names aligned with `problem.json`.

If you are packaging multiple problems, start from the core pack layout
(`content/packs/core/`) and see `docs/authoring/pack-import.md` for the pack
manifest and ZIP/folder structure. A complete single-problem example lives in
`scripts/fixtures/packs/smoke-fixture/`.

## Before opening a PR

```sh
pnpm content:validate
pnpm content:test
pnpm typecheck
pnpm test
```

Then run the problem in the app, not only the CLI, and ask a second person to
review it for ambiguity and originality.
