# Content remediation plan — B4

Last updated: 2026-10-30  
Source findings: `docs/project/content-review-findings.md`  
Review decision: **Approved for alpha via owner waiver** — 7 P0, 23 P1, and 19 P2 findings, all closed.

This is the maintainer's remediation tracker. B4 was closed for the alpha on 2026-10-30 via owner waiver of the independent human second-person requirement. A human second-person review remains a v1.0 requirement.

## Status summary

| Area                                                   | Status                                                                                                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P0-01 — example/test provenance                        | **Closed 2026-10-30** — examples/samples rewritten, clean-list and hidden scans complete, owner accepted provenance audit, originality claims restored |
| P0-02 — `search-tree-check` out-of-range hidden values | Fixed in `e31a2b8`; verified fixed 2026-10-30                                                                                                          |
| P0-03 — `tree-rebuild` invalid traversal pair          | Fixed in all batches; verified fixed 2026-10-30                                                                                                        |
| P0-04 — `expression-calc` unary-minus grammar          | Fixed in `e31a2b8`; verified fixed 2026-10-30                                                                                                          |
| P0-05 — `heaps` pop example                            | Fixed in `e31a2b8`; verified fixed 2026-10-30                                                                                                          |
| P0-06 — `dynamic-programming` edit-distance table      | Fixed in `e31a2b8`; verified fixed 2026-10-30                                                                                                          |
| P0-07 — `trees` traversal-space answer                 | Fixed in `e31a2b8`; verified fixed 2026-10-30                                                                                                          |
| P1-01 — `loop-detect` space claim                      | Fixed in Batch 4; verified fixed 2026-10-30                                                                                                            |
| P1-02 — `word-search` space claim                      | Fixed in Batch 7; verified fixed 2026-10-30                                                                                                            |
| P1-03 — `cargo-deadline` impossible example            | Fixed in Batch 2; verified fixed 2026-10-30                                                                                                            |
| P1-04 — `search-tree-check` recursion depth            | Fixed in Batch 2; verified fixed 2026-10-30                                                                                                            |
| P1-05 — `segment-text` empty text rule                 | Fixed in Batch 6; verified fixed 2026-10-30                                                                                                            |
| P1-06 — `prefix-ledger` root counter hint              | Fixed in final polish; verified fixed 2026-10-30                                                                                                       |
| P1-07 — `orange-rot` TypeScript queue cost             | Fixed in Batch 5; verified fixed 2026-10-30                                                                                                            |
| P1-08 — `product-except` output bound                  | Fixed in Batch 5; verified fixed 2026-10-30                                                                                                            |
| P1-09 — `rotated-search` zero rotation                 | Fixed in Batch 5; verified fixed 2026-10-30                                                                                                            |
| P1-10 — `min-window` empty target                      | Fixed in Batch 5; verified fixed 2026-10-30                                                                                                            |
| P1-11 — `build-order` duplicate prerequisites          | Fixed in Batch 2; verified fixed 2026-10-30                                                                                                            |
| P1-12 — performance-marked tests                       | Fixed in final audit; all 81 problems have at least one marked case; verified fixed 2026-10-30                                                         |
| P1-13 — trees balanced-BST wording                     | Fixed in `e31a2b8`; verified fixed 2026-10-30                                                                                                          |
| P1-14 — stacks histogram boundary wording              | Fixed in final polish; verified fixed 2026-10-30                                                                                                       |
| P1-15 — sliding-window deque state                     | Fixed in final polish; verified fixed 2026-10-30                                                                                                       |
| P1-16 — prefix-sums half-open range mistake            | Fixed in final polish; verified fixed 2026-10-30                                                                                                       |
| P1-17 — greedy lesson exercise mismatch                | Fixed in final polish; verified fixed 2026-10-30                                                                                                       |
| P1-18 — heaps Task Intervals description               | Fixed in final polish; verified fixed 2026-10-30                                                                                                       |
| P1-19 — trees reconstruction exercise                  | Fixed in `e31a2b8`; verified fixed 2026-10-30                                                                                                          |
| P1-20 — graph Build Order wording                      | Fixed in final polish; verified fixed 2026-10-30                                                                                                       |
| P1-21 — system-design rubric checklist                 | Fixed in final polish; verified fixed 2026-10-30                                                                                                       |
| P1-22 — databases range and hash complexity            | Fixed in final polish; verified fixed 2026-10-30                                                                                                       |
| P1-23 — requirements p95 definition                    | Fixed in final polish; verified fixed 2026-10-30                                                                                                       |
| P2-01 — mutation declarations                          | Fixed across Batches 1–8; verified fixed 2026-10-30                                                                                                    |
| P2-02 — duplicate test cases                           | Fixed across the pack; duplicate scan is clean                                                                                                         |
| P2-03, P2-04, P2-05, P2-06, P2-07                      | Fixed; verified fixed 2026-10-30                                                                                                                       |
| P2-08, P2-09, P2-10, P2-11                             | Fixed; verified fixed 2026-10-30                                                                                                                       |
| P2-12 — incomplete explanations                        | Fixed for `window-max` and `prefix-ledger`; verified fixed 2026-10-30                                                                                  |
| P2-13, P2-14, P2-15                                    | Fixed; verified fixed 2026-10-30                                                                                                                       |
| P2-16 — design NFRs and rubric families                | Numeric NFRs added; two seven-dimension rubric families documented; verified fixed 2026-10-30                                                          |
| P2-17, P2-18, P2-19                                    | Fixed in final polish; verified fixed 2026-10-30                                                                                                       |
| R1 — `rotated-search` illustrative array               | Fixed 2026-10-30; verified fixed 2026-10-30                                                                                                            |
| R2 — `island-count` input mutation                     | Fixed 2026-10-30; `paint-fill` already copied its image; verified fixed 2026-10-30                                                                     |
| R3 — `matrix-traversal` transposed-index wording       | Fixed 2026-10-30; verified fixed 2026-10-30                                                                                                            |

**Reviewer final confirmation (2026-10-30, `af4ba7f`):** R1–R3 verified fixed; all 49 original findings are closed. `content:validate` valid, `content:test` 162/162, `typecheck` passed, `format:check` passed. The repository owner accepted the provenance audit, waived the independent human second-person requirement for the alpha, and restored the originality claims. **B4 is closed for the alpha as Done (owner waiver).**

Clean-list spot check (2026-10-30): reviewed `bracket-balance`, `stair-count`, `mid-node`, `subset-list`, and `prefix-ledger`. Their statements, samples, and hidden cases use generic inputs; no copied public examples or test strings were found. `prefix-ledger` also received a 20k-word/20k-query performance case.

## P0-01 remediation

The review found copied LeetCode examples/test data in at least 76 of 81 problems. The five not counted are `bracket-balance`, `stair-count`, `mid-node`, `subset-list`, and `prefix-ledger`. We will still spot-check those five.

The original/license claims were marked as under audit during remediation. The owner accepted the provenance audit on 2026-10-30, and the claims are now restored in `NOTICE`, `CONTENT_LICENSE`, `pack.json`, and every problem attribution.

### Per-batch workflow

For every affected problem:

1. Replace the statement examples with original inputs, chosen to cover distinct edge cases.
2. Regenerate `tests/sample.jsonl` from those inputs and the Python reference; expected values must be computed, not hand-copied.
3. Search `statement.md`, `hints.json`, and `explanation.md` for old sample values and update the prose.
4. Audit `tests/hidden.jsonl` for copied public cases; replace them and add any missing edge cases.
5. Add at least one `"performance": true` case for problems with an explicit complexity target (P1-12).
6. Run `pnpm content:validate` and `pnpm content:test` for the batch.
7. Record the batch in `PROGRESS.md` and mark it here.

### Batch plan (76 affected problems)

| Batch | Problems                                                                                                                                                                                       | Status                                                                                  |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1     | `pair-sum`, `water-between-walls`, `rotation-minimum`, `longest-unique-stretch`, `merge-sorted-chains`, `symmetric-branches`, `island-count`, `kth-largest`, `skip-neighbors`, `target-totals` | **Closed 2026-10-30** — examples/samples, hidden audit, and performance cases complete  |
| 2     | `shift-merge`, `lone-beacon`, `compact-signals`, `warmer-days`, `reverse-chain`, `search-tree-check`, `build-order`, `network-clusters`, `keypad-words`, `cargo-deadline`                      | **Closed 2026-10-30** — examples/samples, hidden audit, and performance cases complete  |
| 3     | `spiral-walk`, `fuel-circuit`, `join-sticks`, `edit-ledger`, `stock-peaks`, `mirrored-text`, `flip-tree`, `letter-tally`, `ordered-search`, `paint-fill`                                       | **Closed 2026-10-30** — examples/samples, hidden audit, and performance cases complete  |
| 4     | `best-stretch`, `ancestor-search`, `merge-window`, `nearest-zero`, `nearest-points`, `height-balance`, `loop-detect`, `note-check`, `triplet-sum`, `level-lines`                               | **Closed 2026-10-30** — examples/samples, hidden audit, and performance cases complete  |
| 5     | `polish-notation`, `coin-count`, `product-except`, `palindrome-build`, `orange-rot`, `rotated-search`, `sum-combinations`, `permutation-list`, `ancestor-tree`, `min-window`                   | **Closed 2026-10-30** — examples, samples, hidden tests, and performance cases complete |
| 6     | `trapped-water`, `majority-value`, `binary-sum`, `tree-diameter`, `color-sort`, `segment-text`, `equal-split`, `strict-integer`, `right-view`, `longest-mirror`                                | **Closed 2026-10-30** — examples, samples, hidden tests, and performance cases complete |
| 7     | `word-chain`, `expression-calc`, `job-schedule`, `merge-k-arrays`, `histogram-area`, `tree-depth`, `duplicate-check`, `path-count`, `tree-rebuild`, `word-search`                              | **Closed 2026-10-30** — examples, samples, hidden tests, and performance cases complete |
| 8     | `anagram-windows`, `task-intervals`, `kth-smallest-tree`, `meeting-overlap`, `center-roots`, `window-max`                                                                                      | **Closed 2026-10-30** — examples, samples, hidden tests, and performance cases complete |

Clean-list spot check: `bracket-balance`, `stair-count`, `mid-node`, `subset-list`, `prefix-ledger`.

### Hidden-test audit

Known copied hidden cases to replace immediately:

- `coin-count` — `[186,419,83,408]`, amount `6249`.
- `longest-mirror` — `"forgeeksskeegfor"`.
- `strict-integer` — public atoi cases such as `"3.14"`, `"+-12"`, `"  -0012a42"`.

Every batch must also scan its hidden file for exact public examples and near-verbatim variants. Replace with original inputs and recompute expected values.

## P1 remediation

1. **Contract and complexity fixes:** P1-01, P1-02, P1-04, P1-07, P1-08, P1-09, P1-10, P1-11.
2. **Performance-marked tests:** P1-12; prioritise `window-max`, `prefix-ledger`, `job-schedule`, `fuel-circuit`, `tree-depth`, then add one per problem where the complexity claim is meaningful.
3. **Lesson alignment:** P1-13–P1-23; fix the exercise descriptions before changing lesson prose so the two stay consistent.
4. **Re-run** `pnpm content:validate`, `pnpm content:test`, `pnpm typecheck`, and `pnpm format:check` after each batch.

## P2 remediation

Do a single polish pass after P0/P1:

- Mutation declarations and copied-array declarations.
- Duplicate test cases.
- Complexity metadata and explanation-section gaps.
- Hint/example wording.
- Design NFR numbers and rubric naming.
- Lesson definitions, diagrams, and attribution URLs.

## Closed (2026-10-30)

B4 is closed for the alpha:

- All 7 P0 findings are fixed; P0-01's examples/samples and hidden canonical-example scan are complete. The owner accepted the provenance audit and the originality claims were restored in `NOTICE`, `CONTENT_LICENSE`, `pack.json`, and all 81 problem attributions.
- All 23 P1 findings are fixed, including P1-12: every one of the 81 problems has at least one `"performance": true` hidden case.
- All 19 P2 findings are fixed or documented, including numeric design NFRs and the two rubric-family note.
- Pack-wide tests have no duplicate sample/hidden inputs, and the five clean-list problems plus a canonical-public-example scan are clean.
- Recheck residuals R1–R3 were fixed at `ae8310e` on 2026-10-30: the `rotated-search` illustration is original, `island-count` copies its grid, and the `matrix-traversal` wording is corrected.
- Verification for the final tree: `pnpm content:validate`, `pnpm content:test` (**162/162**), `pnpm typecheck`, and `pnpm format:check`.
- **Owner waiver:** the independent human second-person sign-off was waived for the alpha by Mohammed Arab (repository owner and content author). It remains a v1.0 requirement.

## Recheck and sign-off

Completed:

1. Sent the reviewer the changed-item list and commits.
2. Reviewer rechecked only the changed items at `f03cce2` and `af4ba7f`.
3. Updated `docs/project/content-review-form.md` with the recheck result and owner waiver.
4. The independent **human** second-person sign-off was waived for the alpha by the repository owner; it remains a v1.0 requirement.
5. B4 closed on 2026-10-30 with green `content:validate` / `content:test` runs.
