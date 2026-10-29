# Content review sign-off — B4

Completed review. Do not treat this as approval: the decision is **Request changes**.

## Reviewer

- Name: Zed coding agent (AI-assisted review)
- Role/background: In-editor AI reviewer; not a content author. This is an AI-assisted Full-tier review, not a substitute for a human second-person sign-off.
- Are you the author of any reviewed item? **No**
- Date: 2026-10-29
- Commit reviewed: `ed7bddd` (content is identical at `41eb54e`; `git diff ed7bddd HEAD -- content/` is empty)
- Review tier: **Full**
- Items reviewed (from `content-review-inventory.md`):
  - Coding: **81**
  - Designs: **8**
  - Lessons: **39**
  - Total: **128**

## Automated checks

- [x] `pnpm content:validate` — **Valid.** 81 problems, 8 designs, 39 lessons. Only the eight expected "no reference Excalidraw scene" warnings (accepted gap B8).
- [x] `pnpm content:test` — **162/162 reference solutions passed.**
- [x] `pnpm typecheck` — **Passed** for `packages/schema`, `packages/content-cli`, and `apps/desktop`.
- [ ] I used the maintainer’s recorded result for this commit instead

Notes: Run with Node 24.22.0 and pnpm 12.15.0 at the reviewed content commit. The automated checks pass; the findings below are content, contract, and test-oracle issues that these checks do not detect.

## Findings

| ID            | Item / path                                                                                                                                           | Kind                     | Severity | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Status |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| P0-01         | `content/packs/core/problems/*/statement.md`, `*/tests/sample.jsonl`, some `tests/hidden.jsonl`; `pack.json:146`; `NOTICE:5-6`; `CONTENT_LICENSE:4-7` | coding (systemic)        | P0       | At least 76 of 81 problems reuse LeetCode example inputs/outputs verbatim or near-verbatim; some hidden tests also copy public test data. The pack, NOTICE, and per-problem attribution claim the content is original, and the pack is licensed CC BY-SA 4.0. This directly violates `docs/authoring/content-policy.md:7-9` and the review packet's "copied text/test" P0 rule.                                                                                                                                 | Open   |
| P0-02         | `problems/search-tree-check/tests/hidden.jsonl:12-13`; `statement.md:67`                                                                              | coding                   | P0       | Hidden tests use `2147483647` and `-2147483648`, outside the stated `±1,000,000,000` constraint. A correct solution using sentinels just outside the stated range fails.                                                                                                                                                                                                                                                                                                                                        | Open   |
| P0-03         | `problems/tree-rebuild/tests/hidden.jsonl:15`; `statement.md:44`                                                                                      | coding                   | P0       | Hidden test 15 is not a valid preorder/inorder pair; no binary tree satisfies both traversals. A correct reconstruction fails, while the provided non-validating solution emits an inconsistent expected tree.                                                                                                                                                                                                                                                                                                  | Open   |
| P0-04         | `problems/expression-calc/statement.md:3,45-50`; both solutions                                                                                       | coding                   | P0       | The statement allows unary `-` without excluding consecutive operators, so `1--2` is valid and equals `3`; both references return `-1`. No test covers it.                                                                                                                                                                                                                                                                                                                                                      | Open   |
| P0-05         | `lessons/heaps/lesson.md:53-62`                                                                                                                       | lesson                   | P0       | The pop worked example leaves `[3,8,5,7,9]` and says "8 is smaller, stop", but 8 > 7. The min-heap property is violated; the correct state is `[3,7,5,8,9]`.                                                                                                                                                                                                                                                                                                                                                    | Open   |
| P0-06         | `lessons/dynamic-programming/lesson.md:79-87`                                                                                                         | lesson                   | P0       | The edit-distance table's first column is `0,1,1,2,3`; it must be `0,1,2,3,4` because `dp[i][0] = i`. The central worked example is impossible under the stated recurrence.                                                                                                                                                                                                                                                                                                                                     | Open   |
| P0-07         | `lessons/trees/lesson.json:28-31,77-78`                                                                                                               | lesson                   | P0       | The self-check answer says traversal space is `O(h)` because "the call stack or queue holds one path or one level", but BFS queue space is `O(w)`, which can be `O(n)`. This contradicts the lesson's own complexity table.                                                                                                                                                                                                                                                                                     | Open   |
| P1-01         | `problems/loop-detect`                                                                                                                                | coding                   | P1       | Metadata and explanation claim `O(1)` space, but the `values`/`linkIndex` signature forces the reference to build an `O(n)` node list before Floyd's scan.                                                                                                                                                                                                                                                                                                                                                      | Open   |
| P1-02         | `problems/word-search`                                                                                                                                | coding                   | P1       | Metadata and explanation claim `O(L)` space, but both references copy the entire board (`O(m·n)`) before searching.                                                                                                                                                                                                                                                                                                                                                                                             | Open   |
| P1-03         | `problems/cargo-deadline/statement.md:43`                                                                                                             | coding                   | P1       | Example 3 says capacity 2 "would need five days because the `3` cannot share a ship"; capacity 2 cannot carry the `3` at all, so that schedule is impossible.                                                                                                                                                                                                                                                                                                                                                   | Open   |
| P1-04 … P1-23 | See `docs/project/content-review-findings.md`                                                                                                         | coding / lesson          | P1       | Remaining P1s: recursive reference overflow at the stated 10k-node bound, unstated empty-input rules (`segment-text`, `min-window`), missing root count in `prefix-ledger` hint 4, `orange-rot` TypeScript `queue.shift()` complexity, `product-except` 32-bit output gap, zero-rotation contradiction in `rotated-search`, untested duplicate prerequisites, no performance-marked tests anywhere, and eleven lesson/rubric inconsistencies (including four misdescribed exercises in `greedy-and-intervals`). | Open   |
| P2-01 … P2-19 | See `docs/project/content-review-findings.md`                                                                                                         | coding / lesson / design | P2       | Polish: undeclared input mutation, duplicate test cases, several ambiguous hints/examples, `path-count` `int` overflow, several space-complexity metadata mismatches, incomplete explanation sections, several lesson definition/diagram polish items, vague design NFR targets, and a missing System Design Primer URL.                                                                                                                                                                                        | Open   |

Add more rows or attach a separate issue/PR. The full evidence, suggested fixes, and affected paths for all 49 findings are in `docs/project/content-review-findings.md`. Use the finding template in `content-review-packet.md`.

### Summary

- P0: **7**
- P1: **23**
- P2: **19**
- **Total: 49 findings** (some findings group several files)

## Originality and license check

- [ ] I did not find copied statements, examples, tests, editorial prose, lesson diagrams, or tables.
  - **Unchecked.** Copied LeetCode examples were found in at least 76 of 81 coding problems, and some hidden tests copy public test data (P0-01). Lesson prose and design prose appear original.
- [x] Problem titles and collection names are trademark-safe.
  - Titles are renamed. "Grind 75" is used descriptively with an attribution to Tech Interview Handbook and a URL.
- [x] Every reviewed item has a license and attribution.
  - Present on all 81 problems, 8 designs, and 39 lessons. The attribution/license **claims are inaccurate** for the copied examples and tests; presence is not correctness.
- [x] The Grind 75 and System Design Primer references are descriptive and attributed, not copied.
  - Grind 75 is attributed with a URL. The System Design Primer is used as a topic checklist and attributed; one lesson lacks the primer/license URL (P2-19).
- [ ] I did not paste unpublished content into an external AI or plagiarism service.
  - **Unchecked / not attestable as written.** This review was performed by an in-editor AI agent. No separate plagiarism service was used, but the content was processed by the reviewing model. A human second-person review is still required if the project's policy demands one.

Notes: The `NOTICE`, `CONTENT_LICENSE`, `pack.json:146`, and every "Original problem by the Base Case contributors" attribution must be corrected if any copied material remains. Do not merely add an attribution link; the policy says not to copy the material.

## Decision

- [ ] **Approve** — no open P0/P1 findings.
- [ ] **Approve with exceptions** — list accepted exceptions and rationale below.
- [x] **Request changes** — P0/P1 findings must be fixed and rechecked.

Exceptions or required changes:

1. **P0-01 (systemic originality)** must be resolved before any sign-off: replace copied examples and sample tests, audit hidden tests, recompute expected outputs, and correct the originality/license claims.
2. **P0-02–P0-07** must be fixed: two invalid/contradictory test suites, the `expression-calc` grammar, and three lesson errors.
3. **P1-01–P1-23** must be fixed or explicitly accepted by the maintainer with a rationale.
4. **P2-01–P2-19** can ship, but should be scheduled.
5. Re-run `pnpm content:validate`, `pnpm content:test`, and `pnpm typecheck` after fixes, and ask the reviewer to recheck only the changed items.

## Reviewer statement

I reviewed the items and tier recorded above against the checklists in `docs/project/content-review-packet.md`. I am not the author of the reviewed content. This sign-off covers only the recorded tier and item count.

This review is **AI-assisted** and does not satisfy a human-only second-person review requirement. The automated checks pass; the content does not.

Signature: Zed coding agent (AI-assisted review)

Human reviewer signature (if required): ______________________________

Date: 2026-10-29

## Maintainer follow-up

- [ ] P0/P1 fixed or accepted with rationale
- [ ] Reviewer rechecked changed items
- [ ] `PROGRESS.md` B4 updated
- [ ] `docs/project/open-blockers.md` B4 updated
- [ ] `pnpm content:validate` and `pnpm content:test` re-run after fixes
