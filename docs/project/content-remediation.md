# Content remediation plan — B4

Last updated: 2026-10-29  
Source findings: `docs/project/content-review-findings.md`  
Review decision: **Request changes** — 7 P0, 23 P1, 19 P2.

This is the maintainer's remediation tracker. It does not change the reviewer's findings or close B4. After the P0/P1 work is complete, the reviewer rechecks only the changed items and a human second-person sign-off is still required.

## Status summary

| Area                                                           | Status                                                |
| -------------------------------------------------------------- | ----------------------------------------------------- |
| P0-01 — example/test provenance                                | **Open** — Batch 4/8 rewritten; 36 problems remaining |
| P0-02 — `search-tree-check` out-of-range hidden values         | Fixed in `e31a2b8`; pending recheck                   |
| P0-03 — `tree-rebuild` invalid traversal pair                  | Fixed in `e31a2b8`; pending recheck                   |
| P0-04 — `expression-calc` unary-minus grammar                  | Fixed in `e31a2b8`; pending recheck                   |
| P0-05 — `heaps` pop example                                    | Fixed in `e31a2b8`; pending recheck                   |
| P0-06 — `dynamic-programming` edit-distance table              | Fixed in `e31a2b8`; pending recheck                   |
| P0-07 — `trees` traversal-space answer                         | Fixed in `e31a2b8`; pending recheck                   |
| P1-01 — `loop-detect` space claim                              | Fixed in Batch 4; pending recheck                     |
| P1-03 — `cargo-deadline` impossible example                    | Fixed in Batch 2; pending recheck                     |
| P1-04 — `search-tree-check` recursion depth                    | Fixed in Batch 2 (iterative + 10k-node test)          |
| P1-11 — `build-order` duplicate prerequisites                  | Fixed in Batch 2 (duplicate tests added)              |
| P1-12 — performance-marked tests                               | In progress; one case added for `search-tree-check`   |
| P1-17 — greedy lesson exercise mismatch                        | Partial — Stock Peaks paragraph fixed in Batch 3      |
| P1-13 — trees balanced-BST wording                             | Fixed in `e31a2b8`; pending recheck                   |
| P1-19 — trees reconstruction exercise                          | Fixed in `e31a2b8`; pending recheck                   |
| Remaining P1-02, P1-05–P1-10, P1-14–P1-16, P1-18, P1-20–P1-23  | Open                                                  |
| P2-01, P2-03, P2-04, P2-07, P2-13, P2-15                       | Fixed in Batch 3/4; pending recheck                   |
| Remaining P2-02, P2-05, P2-06, P2-08–P2-12, P2-14, P2-16–P2-19 | Open; polish pass after P0/P1                         |

## P0-01 remediation

The review found copied LeetCode examples/test data in at least 76 of 81 problems. The five not counted are `bracket-balance`, `stair-count`, `mid-node`, `subset-list`, and `prefix-ledger`. We will still spot-check those five.

The original/license claims are now marked as under audit in `NOTICE`, `CONTENT_LICENSE`, `pack.json`, and every problem attribution. Restore the claims only after the full audit is complete.

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

| Batch | Problems                                                                                                                                                                                       | Status                                                                                 |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1     | `pair-sum`, `water-between-walls`, `rotation-minimum`, `longest-unique-stretch`, `merge-sorted-chains`, `symmetric-branches`, `island-count`, `kth-largest`, `skip-neighbors`, `target-totals` | **Examples/samples done 2026-10-29** — performance cases and full hidden audit pending |
| 2     | `shift-merge`, `lone-beacon`, `compact-signals`, `warmer-days`, `reverse-chain`, `search-tree-check`, `build-order`, `network-clusters`, `keypad-words`, `cargo-deadline`                      | **Examples/samples done 2026-10-29** — performance cases and full hidden audit pending |
| 3     | `spiral-walk`, `fuel-circuit`, `join-sticks`, `edit-ledger`, `stock-peaks`, `mirrored-text`, `flip-tree`, `letter-tally`, `ordered-search`, `paint-fill`                                       | **Examples/samples done 2026-10-29** — performance cases and full hidden audit pending |
| 4     | `best-stretch`, `ancestor-search`, `merge-window`, `nearest-zero`, `nearest-points`, `height-balance`, `loop-detect`, `note-check`, `triplet-sum`, `level-lines`                               | **Examples/samples done 2026-10-29** — performance cases and full hidden audit pending |
| 5     | `polish-notation`, `coin-count`, `product-except`, `palindrome-build`, `orange-rot`, `rotated-search`, `sum-combinations`, `permutation-list`, `ancestor-tree`, `min-window`                   | Open                                                                                   |
| 6     | `trapped-water`, `majority-value`, `binary-sum`, `tree-diameter`, `color-sort`, `segment-text`, `equal-split`, `strict-integer`, `right-view`, `longest-mirror`                                | Open                                                                                   |
| 7     | `word-chain`, `expression-calc`, `job-schedule`, `merge-k-arrays`, `histogram-area`, `tree-depth`, `duplicate-check`, `path-count`, `tree-rebuild`, `word-search`                              | Open                                                                                   |
| 8     | `anagram-windows`, `task-intervals`, `kth-smallest-tree`, `meeting-overlap`, `center-roots`, `window-max`                                                                                      | Open                                                                                   |

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

## Recheck and sign-off

When all P0s and agreed P1s are fixed:

1. Send the reviewer the changed-item list and commit.
2. Ask for a recheck of only those items.
3. Update `docs/project/content-review-form.md` with the recheck result.
4. Obtain a **human** second-person sign-off; the current review is AI-assisted and explicitly does not satisfy that requirement.
5. Close B4 only after the human sign-off and a green `content:validate` / `content:test` run.
