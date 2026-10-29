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
BASE_CASE_EVAL_MODEL=qwen2.5-coder:7b \
BASE_CASE_EVAL_CONTEXT_WINDOW=8192 \
BASE_CASE_EVAL_REVISION=$(git rev-parse --short HEAD) \
pnpm evals
```

Set `BASE_CASE_EVAL_API_KEY` when the endpoint requires one. Set
`BASE_CASE_EVAL_REVISION` to the commit or prompt revision you are evaluating
(for example, `$(git rev-parse --short HEAD)`). Results are written to
`docs/evals/results-openai-compatible.json`. The runner uses the same feature JSON
schema as the app and stores both `rawResponse` and `guardedResponse` for review.
Do not commit API keys or raw provider responses that contain personal data; the
bug-zoo fixtures are synthetic code and failures.

If the endpoint requires custom headers, pass them as a JSON object of string
values:

```sh
BASE_CASE_EVAL_HEADERS='{"x-opencode-session":"your-session-id"}' \
BASE_CASE_EVAL_PROVIDER=openai-compatible \
BASE_CASE_EVAL_BASE_URL=https://your-endpoint/v1 \
BASE_CASE_EVAL_MODEL=your-model \
pnpm evals
```

Header values are not written to the results file; only
`summary.customHeaders: true` is recorded. Do not commit the header value or put it
in the eval results file.

If a model returns truncated JSON or empty content, rerun with a larger diagnostic
budget:

```sh
BASE_CASE_EVAL_MAX_OUTPUT_TOKENS=1200 pnpm evals
```

The app keeps its own per-feature budgets; this override is for diagnosing whether
a model needs more room. `summary.parseFailures` and `summary.emptyResponses`
should both be `0` before human review.

If only a few cases fail, retry just their solutions:

```sh
BASE_CASE_EVAL_ONLY=merge-intervals-descending-sort,linked-list-cycle-null-deref \
BASE_CASE_EVAL_MAX_OUTPUT_TOKENS=1200 \
... pnpm evals
```

A targeted run writes `docs/evals/results-openai-compatible-retry.json`. Merge the
retried cases into the full results file before reviewing; the retry file alone is
not the final eval record.

## Human review

After a real-model run, review the responses with:

```sh
pnpm review:evals
```

To review a specific file:

```sh
pnpm review:evals docs/evals/results-openai-compatible.json
```

The review tool prints the code, failing test, ground-truth bug label, and guarded
response for each unrated case. It asks for:

- `diagnosisCorrect` (`y`/`n`) on **explain** cases only.
- `helpfulness` (`1`–`5`) on every case.

It writes the ratings back to the JSON file after each case and adds a
`humanSummary` with diagnosis accuracy and helpfulness averages. Use `s` to skip
a case and come back to it later.

## Metrics

| Metric                 | Source    | Meaning                                                                    |
| ---------------------- | --------- | -------------------------------------------------------------------------- |
| `explainLabelAccuracy` | automated | `bugType` exactly matches `bugLabel`; a proxy, not a substitute for review |
| `rawLeaks`             | automated | a fenced code block longer than 8 lines appears in the raw response        |
| `guardedLeaks`         | automated | the same check after guardrails; should be 0 below reveal level 4          |
| `parseFailures`        | automated | responses that did not parse as the feature's structured JSON              |
| `emptyResponses`       | automated | responses with no content at all                                           |
| `averageLatencyMs`     | automated | wall-clock time per request                                                |
| `averageInputTokens`   | automated | characters / 4 for the built context                                       |
| `averageOutputTokens`  | automated | characters / 4 for the raw response                                        |
| `diagnosisCorrect`     | human     | is the diagnosis actually right, even if the label differs?                |
| `helpfulness`          | human     | 1–5: would this move a learner forward?                                    |

`helpfulness` and `diagnosisCorrect` start as `null`. Review the cases and fill them
in for a real-model run. Keep the filled file next to the raw result.

## B3 pass criteria

- Leakage: **0** raw or guarded leaks across the 60 cases (below the 1% target).
- Diagnosis accuracy: **≥ 70%** on the 30 explain cases, or keep the AI feature
  labeled experimental with pre-authored hints as the primary path.
- Helpfulness: **> 4.0 / 5** average across the reviewed cases.
- Record the provider, model, endpoint, date, revision, automated summary, and
  human summary in the results file.

## Review protocol

1. Read the failing test and the labelled bug first.
2. Read the response without looking at the label.
3. Mark `diagnosisCorrect` true when the explanation identifies the cause, not just a
   symptom. This applies to **explain** cases; leave it `null` for hints.
4. Mark `helpfulness` 1 (useless) to 5 (unblocks the learner with one concrete step)
   for both explain and hint cases.
5. Mark leakage separately; guardrails should make this rare, but a model can still
   leak a solution in prose.

## Recorded real-model result (2026-10-28)

- Model: `deepseek-v4.1-flash` via an OpenAI-compatible endpoint.
- Cases: 60, 59 reviewed.
- Explain diagnosis: 30/30 correct (100%).
- Helpfulness: 4.9/5 overall (explain 5.0, hint 4.79).
- Leakage: 0 raw, 0 guarded.
- One provider failure: `linked-list-cycle-null-deref` hint was truncated after
  1200- and 2000-token retries; it is left unreviewed rather than marked correct.
- Review method: AI-assisted at the maintainer's request, with a maintainer
  spot-check. This is not an independent second-person review.
- Full record: `docs/evals/results-openai-compatible.json`.

## When to re-run

- Any change to `apps/desktop/src/main/ai-prompts.ts`.
- Any change to the context builder, truncation policy, or redaction.
- A new provider or model.
- A new structured-output contract.

Record the provider, model, date, and prompt revision in the results file. The runner
writes `generatedAt`, `provider`, and the summary automatically.
