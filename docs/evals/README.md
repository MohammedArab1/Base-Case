# AI evals

The bug zoo exercises the **explain failure** and **hint** prompts against known-bad
solutions. It exists so prompt changes can be compared instead of judged by vibes.

## Fixtures

`bug-zoo.json` contains 10 problems with 3 labelled bad solutions each (30 cases).
Every solution has:

- `bugLabel` — `off_by_one`, `wrong_pattern`, `boundary`, `mutation`, `base_case`,
  `null_dereference`, `infinite_loop`, `missing_levels`, `wrong_comparison`,
  `initialization`, or `wrong_output`.
- `code` — the learner's solution.
- `failure` — the first failing test: status, input, expected, actual, optional
  stderr and error.

The runner builds the same context the app sends: problem brief, code, the first
failing test, and the feature instruction. It never includes hidden tests or a
reference design.

## Run

```sh
pnpm evals
```

This uses the deterministic mock provider and writes
`docs/evals/results-mock.json`. It is a plumbing check: the mock always returns the
same diagnosis, so its accuracy number is not a quality signal.

To evaluate a real OpenAI-compatible endpoint:

```sh
BASE_CASE_EVAL_PROVIDER=openai-compatible \
BASE_CASE_EVAL_BASE_URL=http://127.0.0.1:11434/v1 \
BASE_CASE_EVAL_MODEL=qwen2.5-coder \
BASE_CASE_EVAL_CONTEXT_WINDOW=8192 \
pnpm evals
```

Set `BASE_CASE_EVAL_API_KEY` when the endpoint requires one. Results are written to
`docs/evals/results-openai-compatible.json`. Do not commit API keys or raw provider
responses that contain personal data.

## Metrics

| Metric                 | Source    | Meaning                                                                    |
| ---------------------- | --------- | -------------------------------------------------------------------------- |
| `explainLabelAccuracy` | automated | `bugType` exactly matches `bugLabel`; a proxy, not a substitute for review |
| `rawLeaks`             | automated | a fenced code block longer than 8 lines appears in the raw response        |
| `guardedLeaks`         | automated | the same check after guardrails; should be 0 below reveal level 4          |
| `averageLatencyMs`     | automated | wall-clock time per request                                                |
| `averageInputTokens`   | automated | characters / 4 for the built context                                       |
| `averageOutputTokens`  | automated | characters / 4 for the raw response                                        |
| `diagnosisCorrect`     | human     | is the diagnosis actually right, even if the label differs?                |
| `helpfulness`          | human     | 1–5: would this move a learner forward?                                    |

`helpfulness` and `diagnosisCorrect` start as `null`. Review the cases and fill them
in for a real-model run. Keep the filled file next to the raw result.

## Review protocol

1. Read the failing test and the labelled bug first.
2. Read the response without looking at the label.
3. Mark `diagnosisCorrect` true when the explanation identifies the cause, not just a
   symptom.
4. Mark `helpfulness` 1 (useless) to 5 (unblocks the learner with one concrete step).
5. Mark leakage separately; guardrails should make this rare, but a model can still
   leak a solution in prose.

## When to re-run

- Any change to `apps/desktop/src/main/ai-prompts.ts`.
- Any change to the context builder, truncation policy, or redaction.
- A new provider or model.
- A new structured-output contract.

Record the provider, model, date, and prompt revision in the results file. The runner
writes `generatedAt`, `provider`, and the summary automatically.
