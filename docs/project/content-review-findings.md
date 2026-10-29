# Content review findings — B4 (Full tier)

- **Reviewer:** Zed coding agent (AI-assisted, in-editor review)
- **Date:** 2026-10-29
- **Commit reviewed:** `ed7bddd` (content is identical at `41eb54e`; `git diff ed7bddd HEAD -- content/` is empty)
- **Tier:** Full — 81 coding problems, 8 design scenarios, 39 lessons (128 items)
- **Decision:** **Request changes** — P0 findings are open.

This document accompanies the completed `docs/project/content-review-form.md` and is the detailed finding log referenced from that form.

> **Maintainer update 2026-10-29:** P0-02–P0-07 and P1-01, P1-03, P1-04, P1-11, P1-13, P1-19 are fixed; P0-01 example/test remediation is at Batch 4/8; P1-12 performance tests are in progress; P1-17 is partially fixed; P2-01, P2-03, P2-04, P2-07, P2-13, P2-15 are fixed. See `docs/project/content-remediation.md` for live status. The findings below remain the reviewer's original record; they are not rewritten.

## Automated checks

Run with Node 24.22.0 and pnpm 12.15.0 at the reviewed content commit.

| Command                 | Result                                                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm content:validate` | **Valid.** 81 problems, 8 designs, 39 lessons. Only the eight expected "no reference Excalidraw scene" warnings (accepted gap B8). |
| `pnpm content:test`     | **162/162 reference solutions passed.**                                                                                            |
| `pnpm typecheck`        | **Passed** for `packages/schema`, `packages/content-cli`, and `apps/desktop`.                                                      |

Passing automation does not clear the findings below. The P0 items are content, contract, and test-oracle problems that the current validator and reference runs do not detect.

## Summary

| Severity | Findings | Meaning                                 |
| -------- | -------: | --------------------------------------- |
| P0       |        7 | Blocks sign-off until fixed             |
| P1       |       23 | Fix before release or explicitly accept |
| P2       |       19 | Polish; fix when convenient             |

Counts are findings, not items; some findings group several files. All P0 findings and the material P1 findings were re-checked directly against the files. Lower-severity items came from the batch passes and spot checks.

---

# P0 — blocking findings

## P0-01 — At least 76 of 81 coding problems reuse LeetCode examples, and some reuse copied test data

**Paths:** `content/packs/core/problems/*/statement.md`, `content/packs/core/problems/*/tests/sample.jsonl`, some `tests/hidden.jsonl`; claims at `content/packs/core/pack.json:146`, `NOTICE:5-6`, `CONTENT_LICENSE:4-7`; policy at `docs/authoring/content-policy.md:7-9` and `docs/project/content-review-packet.md:154`.

**Observation.** The examples are not merely familiar algorithm inputs; in most problems they are the exact inputs and outputs published for the corresponding LeetCode problem. Representative verified matches:

| Base Case item               | Base Case example                                                                                               | Public source                           |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `pair-sum`                   | `nums = [2,7,11,15], target = 9 -> [0,1]`; `[3,2,4], 6 -> [1,2]`; `[3,3], 6 -> [0,1]` (`statement.md:21,30,39`) | LeetCode 1, Examples 1–3                |
| `water-between-walls`        | `[1,8,6,2,5,4,8,3,7] -> 49`; `[1,1] -> 1` (`statement.md:20,27`)                                                | LeetCode 11, Examples 1–2               |
| `longest-unique-stretch`     | `"abcabcbb" -> 3`; `"bbbbb" -> 1`; `"pwwkew" -> 3`                                                              | LeetCode 3, Examples 1–3                |
| `island-count`               | The 4×5 grid `[[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1]] -> 3`                                           | LeetCode 200, Example 1                 |
| `trapped-water`              | `[0,1,0,2,1,0,1,3,2,1,2,1] -> 6`; `[4,2,0,3,2,5] -> 9` (`statement.md:20,27`)                                   | LeetCode 42, Examples 1–2               |
| `triplet-sum`                | `[-1,0,1,2,-1,-4] -> [[-1,-1,2],[-1,0,1]]` and the other two examples                                           | LeetCode 15, Examples 1–3               |
| `word-search`                | The `ABCE/SFCS/ADEE` board and `"ABCCED"`, `"SEE"`, `"ABCB"`                                                    | LeetCode 79, Examples 1–3               |
| `window-max`                 | `[1,3,-1,-3,5,3,6,7], k = 3 -> [3,3,5,5,6,7]`                                                                   | LeetCode 239, Example 1                 |
| `coin-count` hidden test     | `coins = [186,419,83,408], amount = 6249 -> 20` (`tests/hidden.jsonl:15`)                                       | LeetCode 322 example                    |
| `strict-integer`             | `"4193 with words" -> 4193`; `"words and 987" -> 0`; hidden `"3.14"`, `"+-12"`, `"  -0012a42"`                  | LeetCode 8 examples and public test set |
| `longest-mirror` hidden test | `"forgeeksskeegfor" -> "geeksskeeg"` (`tests/hidden.jsonl:8`)                                                   | GeeksforGeeks test string               |

The batch passes recognized exact or near-exact matches in 76 of 81 problems. The five not counted are `bracket-balance`, `stair-count`, `mid-node`, `subset-list`, and `prefix-ledger`; their cases are generic or original. The remaining 76 include examples that are copied in whole or in part. The `leetcodeSlug` field on `pair-sum` and the 75-problem Grind 75 collection make the source mapping explicit.

**Why it matters.** This directly violates the project's non-negotiable policy:

- `docs/authoring/content-policy.md:7-9`: "Do not copy LeetCode statements, examples, constraints, test cases, or editorial prose."
- `docs/authoring/content-policy.md:16-17`: "Do not copy test cases from another judge. Generate your own and validate them with independent solutions."
- `NOTICE:5-6`: "The project itself does not include copied LeetCode statements, examples, constraints, test cases, or editorial content."
- `content/packs/core/pack.json:146`: "Every statement, example, hint, and test here is original to Base Case."

The pack is licensed CC BY-SA 4.0 and every `problem.json` says "Original problem by the Base Case contributors." Those claims are inaccurate for the copied example and test data, and LeetCode content is not available under that license. Under the review packet's severity table (`content-review-packet.md:154`), copied text/test material is P0. This is the single largest blocker in the review.

**Suggested change.** Replace every copied example and sample test with original inputs, then recompute expected outputs and update any explanation prose that names the old values. Audit `tests/hidden.jsonl` for copied cases as well; the three examples above are not exhaustive. Until the audit is complete, remove the blanket "original" claim from `pack.json`, `NOTICE`, and the per-problem attribution, and correct the license statement. Do not merely add an attribution link: the policy says not to copy the material.

## P0-02 — `search-tree-check` hidden tests use values outside the stated constraint

**Paths:** `content/packs/core/problems/search-tree-check/tests/hidden.jsonl:12-13`; `statement.md:67`; both reference solutions.

**Evidence:**

```
{"input":{"root":[2147483647]},"expected":true}
{"input":{"root":[-2147483648]},"expected":true}
```

The statement constrains node values to `-1,000,000,000 <= node value <= 1,000,000,000`.

**Why it matters.** A correct solution may use sentinels just outside the stated range, for example `-1_000_000_001` and `1_000_000_001`. That solution is correct for every input the statement permits, but returns `false` for these two hidden cases. The reference solutions pass only because they use infinities. A learner can fail a hidden test for honoring the published contract.

**Suggested change.** Replace the two cases with `1_000_000_000` and `-1_000_000_000`, or widen the constraint to the signed 32-bit range and state the new bound. Add a visible sample case at the boundary.

## P0-03 — `tree-rebuild` hidden test 15 is not a valid preorder/inorder pair

**Paths:** `content/packs/core/problems/tree-rebuild/tests/hidden.jsonl:15`; `statement.md:44`.

**Evidence:**

```
{"input":{"preorder":[100,50,150,25,75,125,175],"inorder":[25,50,75,100,125,150,175]},"expected":[100,50,null,150,null,25,null,null,75,125,null,175]}
```

`preorder[0] = 100`. In `inorder`, the values before `100` are `[25,50,75]`, so the left subtree must contain exactly those values. But the next three preorder values are `[50,150,25]`, and `150` belongs to the right-side values `[125,150,175]`. No binary tree can satisfy both traversals.

**Why it matters.** A standard recursive reconstruction fails on this case, while the provided non-validating iterative solution happens to emit an expected tree that is itself inconsistent with the traversals. The test rewards implementation-specific behavior on invalid input and can reject a correct solution. It contradicts `statement.md:44`: "Both traversals describe the same binary tree."

**Suggested change.** Replace the case with consistent traversals, for example `preorder = [100,50,25,75,150,125,175]` and the same `inorder`, expecting `[100,50,150,25,75,125,175]`. Add a test that validates the round trip.

## P0-04 — `expression-calc` returns the wrong value for a valid unary-minus expression

**Paths:** `content/packs/core/problems/expression-calc/statement.md:3,45-50`; `solutions/python.py:11-14`; `solutions/typescript.ts:11-14`.

**Evidence.** The statement says "A `-` may act as a unary sign, such as in `"-2 + 1"`." It does not exclude a unary sign after a binary operator. The constraints only say parentheses are balanced and the expression is valid. Both references treat every `-` as committing the previous term:

```python
elif character == "+" or character == "-":
    total += sign * number
    number = 0
    sign = 1 if character == "+" else -1
```

For the valid expression `1--2` (that is, `1 - (-2)`), the references return `-1` instead of `3`. No hidden case exercises consecutive operators.

**Why it matters.** A learner who writes a standard parser returns the mathematically correct answer and fails against the reference, or a learner following the reference learns an incorrect grammar. The statement and the solution disagree about the input language.

**Suggested change.** Either add the LeetCode-style restriction "There are no two consecutive operators; a unary `-` appears only at the start or immediately after `(`", or make both references handle a unary sign after an operator. Add a test for `1--2` either way.

## P0-05 — `heaps` lesson pop example leaves an invalid min-heap

**Path:** `content/packs/core/lessons/heaps/lesson.md:53-62`.

**Evidence.** After moving `8` to the root, the lesson shows `[3, 8, 5, 7, 9]` and then says:

```
compare with children 7 and 9 -> 8 is smaller, stop
```

`8` is not smaller than `7`. The min-heap property is violated: a parent must be no larger than either child.

**Why it matters.** A learner following the worked example implements a sift-down that stops on the smaller child instead of swapping with it. The correct state after the swap is `[3, 7, 5, 8, 9]`.

**Suggested change.** Change the line to "8 is larger than 7, swap with 7" and show `[3, 7, 5, 8, 9]`. Add the next comparison so the example finishes correctly.

## P0-06 — `dynamic-programming` lesson edit-distance table has an impossible base column

**Path:** `content/packs/core/lessons/dynamic-programming/lesson.md:79-87`.

**Evidence.** The state definition says `dp[i][j]` is the edit distance from the first `i` characters of `word1` to the first `j` characters of `word2`. The lesson prints:

```text
        ""  c  a  t
   ""    0  1  2  3
   c     1  0  1  2
   a     1  1  0  1
   r     2  2  1  1
   t     3  3  2  1
```

For `j = 0`, `dp[i][0]` must equal `i`, because all `i` characters must be deleted. The first column should be `0, 1, 2, 3, 4`, and the row for `a` should start at `2`, not `1`.

**Why it matters.** The central worked example is impossible under the stated recurrence. A learner checking an implementation against the table sees a base case that cannot be produced, and may copy the wrong initialisation.

**Suggested change.** Print:

```text
        ""  c  a  t
   ""    0  1  2  3
   c     1  0  1  2
   a     2  1  0  1
   r     3  2  1  1
   t     4  3  2  1
```

Also label the axes: `word1 = "cart"` (rows), `word2 = "cat"` (columns).

## P0-07 — `trees` lesson self-check answer contradicts its own complexity table

**Paths:** `content/packs/core/lessons/trees/lesson.json:28-31` and `:77-78`.

**Evidence.** The complexity table says level-order traversal uses `O(w)` space, where `w` is the maximum width of a level. The self-check asks why traversal space is `O(h)` and answers:

> "The call stack or queue holds one path or one level, not every node at once. h is the height."

**Why it matters.** That answer conflates DFS and BFS. A DFS call stack holds a path of height `h`; a BFS queue holds a level of width `w`, and `w` can be `O(n)` (about `n/2` in a complete tree). A learner who trusts the answer will state the wrong space bound for level-order traversal and contradict the table immediately above it.

**Suggested change.** Restrict the question to depth-first traversal, or answer: "DFS uses `O(h)` call-stack space; BFS uses `O(w)` queue space, and `w` can be `O(n)`."

---

# P1 — fix before release or explicitly accept

| ID    | Item / path                                                                                     | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Suggested change                                                                                                                                                                                            |
| ----- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1-01 | `loop-detect` (`problem.json:48,55`; `explanation.md:21-22`; `solutions/python.py:9-15`)        | The signature takes `values` and `linkIndex`, and the reference allocates an `n`-element list of `ListNode` objects before running Floyd's algorithm. The `O(1)` space claim describes only the scan, not the supplied solution.                                                                                                                                                                                                                                                                                                                      | Say "`O(n)` to build the list; `O(1)` extra for the cycle scan", or change the signature to take a `ListNode` so `O(1)` is true.                                                                            |
| P1-02 | `word-search` (`problem.json:49,56`; `explanation.md:22`; both solutions)                       | The explanation and metadata claim `O(L)` space, but both references copy the entire board (`grid = [list(row) for row in board]` / `board.map(row => row.split(''))`), which is `O(m·n)`.                                                                                                                                                                                                                                                                                                                                                            | Change the claim to `O(m·n + L)`, or use a visited set if `O(L)` is intended.                                                                                                                               |
| P1-03 | `cargo-deadline` (`statement.md:43`)                                                            | Example 3 says "Capacity 2 would need five days because the `3` cannot share a ship." Capacity 2 cannot carry weight 3 at all; there is no five-day schedule under the statement's rule that every package must fit.                                                                                                                                                                                                                                                                                                                                  | Say capacity 2 cannot carry the `3`; capacity 3 is the first feasible capacity, with loads `[1,2]`, `[3]`, `[1,1]`.                                                                                         |
| P1-04 | `search-tree-check` (`solutions/python.py:10`; `solutions/typescript.ts:12`; `statement.md:66`) | Both references recurse once per level. A valid 10,000-node skewed tree exceeds Python's default recursion limit and the JS call stack. The largest hidden tree has 15 nodes, so the failure is latent.                                                                                                                                                                                                                                                                                                                                               | Make both references iterative with an explicit stack, or lower the node bound and state it. Add a deep-chain test.                                                                                         |
| P1-05 | `segment-text` (`statement.md:3`; `tests/hidden.jsonl:1-2`)                                     | The statement never says whether an empty `text` counts as a complete segmentation. Two hidden tests require `true`; a learner who reads "split into a sequence of dictionary words" as requiring at least one word returns `false`.                                                                                                                                                                                                                                                                                                                  | Add "An empty text is segmented by zero words, so return `true`", or disallow empty text and change the tests. Add a visible sample.                                                                        |
| P1-06 | `prefix-ledger` (`hints.json:18-21`; `solutions/python.py:14-23`; `tests/hidden.jsonl:13`)      | Level 4 says "set node = root and loop over its characters: ... then increment that child's count." It never increments the root. Following it returns `[0]` for the empty query, while the reference and hidden test expect `[2]`.                                                                                                                                                                                                                                                                                                                   | Increment the root once per word before the character loop, and say so in the hint.                                                                                                                         |
| P1-07 | `orange-rot` (`solutions/typescript.ts:20-24`; `statement.md:48`; `explanation.md:20-22`)       | The TypeScript reference uses `queue.shift()` inside BFS. `shift()` is `O(queue length)`, so the worst case is `O((m·n)²)`, not the stated `O(m·n)`. The 1,000×1,000 bound can time out; hidden cases are tiny.                                                                                                                                                                                                                                                                                                                                       | Use an index cursor or a deque, and add a near-bound performance case.                                                                                                                                      |
| P1-08 | `product-except` (`statement.md:5,42`)                                                          | The statement guarantees that "the product of any prefix or suffix of `nums` fits in a signed 32-bit integer." That does not bound the output at a zero, which is the product of the prefix and suffix. For example, twelve `30`s around one zero produce `30^12`, beyond 32-bit and beyond JavaScript's exact integer range.                                                                                                                                                                                                                         | Guarantee that each output value fits in a signed 32-bit integer (or bound the non-zero product around a zero), and add a boundary test.                                                                    |
| P1-09 | `rotated-search` (`statement.md:3,9`; `explanation.md:5,28`; `tests/hidden.jsonl:3-4`)          | The statement says the list was "rotated at an unknown pivot", which implies a nonzero rotation, but hidden tests include unrotated `[1,2]`. The explanation says "two sorted runs", which is false for zero rotation, and its common mistake says "Assuming the list is not rotated" while `problem.json` warns about the opposite.                                                                                                                                                                                                                  | Say "possibly rotated; the rotation may be zero", change "two sorted runs" to "at most two", and align the common-mistakes lists.                                                                           |
| P1-10 | `min-window` (`statement.md:1-15,35-42`; `tests/hidden.jsonl:3`)                                | The constraints allow `target.length = 0`, but the statement does not define the empty-target result. A hidden test expects `""`; a learner who treats substrings as non-empty can return `"a"` for `source = "a", target = ""`.                                                                                                                                                                                                                                                                                                                      | Add "If `target` is empty, return `""`" or disallow an empty target.                                                                                                                                        |
| P1-11 | `build-order` (`statement.md:5,66`; `explanation.md:30`; `tests/hidden.jsonl`)                  | Duplicate prerequisite pairs are explicitly allowed and the explanation warns about double-counting them, but no hidden case contains a duplicate pair. A solution that deduplicates adjacency and increments indegree per duplicate passes all tests while returning the wrong answer for `numModules = 3, prerequisites = [[1,0],[1,0],[2,1]]`.                                                                                                                                                                                                     | Add duplicate-pair cases, including one that must be `true` and one that must be `false`.                                                                                                                   |
| P1-12 | Pack-wide tests (`tests/hidden.jsonl` in all 81 problems)                                       | No hidden suite is marked `"performance": true`; the schema and authoring guide require marked performance tests. Several problems with explicit complexity requirements accept naive solutions: `window-max` (largest hidden case 9 elements; `O(n·k)` passes), `prefix-ledger` (6 words/6 queries; `O(words×queries)` passes), `job-schedule` (5 jobs; `O(n²)` passes), `fuel-circuit` (5 stations; `O(n²)` passes), `tree-depth` (8 nodes; recursion passes but would fail at 100,000).                                                            | Add at least one near-bound, performance-marked case per problem, prioritising the five listed. Recalibrate `timeMs` after adding them.                                                                     |
| P1-13 | `trees` lesson (`lesson.json:34-37`)                                                            | The complexity row says "Search in a balanced binary tree" is `O(log n)`. A balanced but unordered binary tree has no ordering rule, so value search is `O(n)`; only a balanced BST gives `O(log n)`.                                                                                                                                                                                                                                                                                                                                                 | Change the operation to "Search in a balanced BST", or say "access by a known path".                                                                                                                        |
| P1-14 | `stacks` lesson (`lesson.md:87-89`)                                                             | The histogram example says a bar of height 5 can extend "right to the next 1", but the array `2 1 5 6 2 3` contains only one `1`, on the left. The nearest smaller bar on the right is `2` at index 4.                                                                                                                                                                                                                                                                                                                                                | Change to "right to the 2 at index 4".                                                                                                                                                                      |
| P1-15 | `sliding-window` lesson (`lesson.md:108-111`)                                                   | The deque state is wrong. With the exercise's `k = 3`, after adding index 3 the deque should be `[1, 3]` (values 3, -3), because index 1 is still inside the window. The lesson shows `[3]` and says "3 is still at the front", which is false for either `k = 2` or `k = 3`.                                                                                                                                                                                                                                                                         | State `k = 3` and show `[1, 3] value 3, -3`; then show the expiry step.                                                                                                                                     |
| P1-16 | `prefix-sums` lesson (`lesson.json:51`; `lesson.md:19,77`)                                      | The common mistake says "Using `prefix[right] - prefix[left]` when the range should include the left endpoint." That expression is the half-open range `[left, right)`, which already includes the left endpoint and excludes the right. The mistake is when the range must include the **right** endpoint.                                                                                                                                                                                                                                           | Change "left" to "right" and state the half-open convention in the key point.                                                                                                                               |
| P1-17 | `greedy-and-intervals` lesson (`lesson.md:24,43,61,81`)                                         | Four linked exercises are described as different problems: (a) Stock Peaks is single-transaction, but the lesson teaches "add every upward price change" (unlimited trades); on the exercise's example it gives 7 instead of 5. (b) Merge Window inserts one interval into a sorted non-overlapping list; the lesson teaches merging an unsorted overlapping list. (c) Meeting Overlap is a boolean overlap check; the lesson teaches maximum non-overlapping meetings. (d) Task Intervals is a cooldown scheduler; the lesson teaches minimum rooms. | Align each paragraph with the actual `statement.md`, or add separate exercises for the algorithms being taught.                                                                                             |
| P1-18 | `heaps` lesson (`lesson.md:103`)                                                                | Task Intervals is described as "the minimum number of machines to run tasks" with a min-heap of end times. The exercise is the task-scheduler/cooldown problem, which that algorithm does not solve.                                                                                                                                                                                                                                                                                                                                                  | Replace the paragraph with the frequency/frame solution, or link a true minimum-rooms exercise.                                                                                                             |
| P1-19 | `trees` lesson (`lesson.md:116-130`)                                                            | "To rebuild a tree, read the root, then attach children in queue order. **Tree Rebuild** is the exercise for this." Tree Rebuild takes preorder and inorder traversals, not a level-order list.                                                                                                                                                                                                                                                                                                                                                       | Rewrite the paragraph for preorder/inorder reconstruction, or clarify that the level-order list is only the input encoding and Tree Rebuild is a different exercise.                                        |
| P1-20 | `graph-algorithms` lesson (`lesson.md:18`)                                                      | "**Build Order** asks for a sequence that satisfies every dependency." The exercise returns a boolean: whether every module can be built.                                                                                                                                                                                                                                                                                                                                                                                                             | Say "Build Order asks whether a valid sequence exists; the same Kahn traversal can produce the sequence if asked."                                                                                          |
| P1-21 | `system-design-interview` lesson (`lesson.md:135-143`)                                          | The lesson says "The app's design rubric uses these dimensions" and lists Requirements, API, Data model, High-level architecture, Deep dives, Trade-offs, Failure modes and monitoring. No design rubric uses that exact set: four use "Scale and performance" instead of "Deep dives"; four use "Back-of-envelope estimation", "API and data model", and "Communication and failure handling".                                                                                                                                                       | Normalise the eight rubrics to one seven-dimension scheme, or change the lesson to "a useful seven-part checklist; individual rubrics group these slightly differently" and point to the per-design rubric. |
| P1-22 | `databases` lesson (`lesson.md:28`; `lesson.json:25-32`)                                        | The prose says a B-tree index supports range queries in `O(log n)`, but a range returning `k` rows costs `O(log n + k)`; the lesson's own table says `O(log n + results)`. The table also says primary-key lookup is "`O(log n)` or `O(1)`" without marking the hash case as average or mentioning collisions.                                                                                                                                                                                                                                        | Change the prose to `O(log n + k)` and qualify the hash lookup as average-case.                                                                                                                             |
| P1-23 | `requirements-and-estimation` lesson (`lesson.md:23`)                                           | "Latency: redirects under 100 ms at p95." `p95` is never defined; the definition appears in `performance-scalability-latency` (order 31), which lists this lesson as a prerequisite.                                                                                                                                                                                                                                                                                                                                                                  | Define `p95` at first use, or link to the percentile explanation.                                                                                                                                           |

---

# P2 — polish

| ID    | Item / path                                                                                                                                                                                                                                                                                            | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                       | Suggested change                                                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P2-01 | `triplet-sum`, `sum-combinations`, `orange-rot`, `island-count`, `paint-fill` (`problem.json` `mutates: []`)                                                                                                                                                                                           | Both references mutate the input: `triplet-sum` and `sum-combinations` sort the input array in place; `orange-rot` and `island-count` overwrite grid cells to mark visited; `paint-fill` overwrites the image and returns it. The tests do not capture mutation, so they pass.                                                                                                                                                                | Copy before mutating, or declare the parameter in `mutates` and use the `mutated` expected shape.                                                                     |
| P2-02 | `network-clusters`, `word-chain`, `cargo-deadline`, `spiral-walk`, `tree-depth` (`tests/`)                                                                                                                                                                                                             | Redundant cases: `network-clusters` and `word-chain` each contain an exact duplicate hidden line; `cargo-deadline` repeats two sample cases in hidden; `spiral-walk` and `tree-depth` each repeat one sample case.                                                                                                                                                                                                                            | Replace duplicates with distinct edge cases.                                                                                                                          |
| P2-03 | `join-sticks` (`statement.md:3,47`)                                                                                                                                                                                                                                                                    | The opening says "several wooden sticks of different lengths", but Example 4 is `[4,4]` and hidden cases include `[1,1,1]` and `[1,1,1,1]`.                                                                                                                                                                                                                                                                                                   | Say "sticks of various lengths; duplicate lengths are allowed."                                                                                                       |
| P2-04 | `note-check` (`statement.md:3,42`; `explanation.md:27`)                                                                                                                                                                                                                                                | The statement says "Letters are case-sensitive", but the constraints allow only lowercase letters. The case-sensitivity rule is vacuous and the related common mistake cannot occur; the reference's 26-slot array would fail on uppercase.                                                                                                                                                                                                   | Remove the case-sensitivity sentence and the uppercase mistake, or broaden the constraint and update both references.                                                 |
| P2-05 | `compact-signals` (`hints.json:16`)                                                                                                                                                                                                                                                                    | Level 3 says "shorten the array to the write position and return it." The required return is the count, not the array; "it" reads as the array. Level 4's pseudocode correctly says `return write`.                                                                                                                                                                                                                                           | Say "return that position (`write`)."                                                                                                                                 |
| P2-06 | `permutation-list` (`explanation.md:26`)                                                                                                                                                                                                                                                               | The explanation says "Sorting only the output instead of the choices, which can disturb generation order" is a common mistake. The statement requires lexicographic output, and sorting the final output is a valid way to produce it; this is not a correctness mistake.                                                                                                                                                                     | Replace with "Relying on input order without sorting the choices or the final output."                                                                                |
| P2-07 | `triplet-sum` (`statement.md:20`; `tests/sample.jsonl:1`)                                                                                                                                                                                                                                              | The statement example is unsorted `[-1,0,1,2,-1,-4]`, but the sample test uses sorted `[-4,-1,-1,0,1,2]`. The multiset and output match, but the sample does not literally match the example.                                                                                                                                                                                                                                                 | Use the statement's input in the sample test, or state that order is irrelevant.                                                                                      |
| P2-08 | `path-count` (`problem.json:23`; `tests/hidden.jsonl:14-15`)                                                                                                                                                                                                                                           | The signature declares `returns: "int"`, but hidden cases expect `35,345,263,800` and `17,672,631,900`, beyond signed 32-bit. The project already uses `long` for 64-bit results.                                                                                                                                                                                                                                                             | Change `returns` to `long`, or reduce the grid bound so the answer fits 32 bits.                                                                                      |
| P2-09 | `binary-sum` (`problem.json:48,55`; `explanation.md:22`)                                                                                                                                                                                                                                               | The solution metadata says `space: "O(1)"`, but both references build a `digits` buffer of length `n + m`; the explanation says `O(n + m)`.                                                                                                                                                                                                                                                                                                   | Change the metadata to `O(n + m)`, or qualify "O(1) auxiliary excluding the output buffer."                                                                           |
| P2-10 | `meeting-overlap` (`problem.json:44,51`; `explanation.md:21`)                                                                                                                                                                                                                                          | The metadata and explanation say `O(1)` space, but both references copy and sort the intervals (`sorted(...)` / `[...intervals].sort(...)`), which is `O(n)`.                                                                                                                                                                                                                                                                                 | Report `O(n)` for the sorted copy, or sort in place and declare `mutates: ["intervals"]`.                                                                             |
| P2-11 | `histogram-area` (`explanation.md:17`)                                                                                                                                                                                                                                                                 | "The new stack top is the nearest shorter bar on its left" is false for equal heights: the new top can be an equal-height bar, and the width computed there is not the widest for that bar. The algorithm still returns the correct answer because the earlier equal bar is popped later.                                                                                                                                                     | Say "nearest bar with height ≤ the popped height; equal-height bars are popped later and produce the wider candidate."                                                |
| P2-12 | `prefix-ledger`, `window-max` (`explanation.md`)                                                                                                                                                                                                                                                       | Both explanations contain only Complexity, Correctness sketch, and Related idea. They omit the Algorithm steps and Common mistakes sections required by `docs/authoring/problem-authoring.md:124,127`. The app still shows `problem.json.commonMistakes`, but the explanation document is incomplete.                                                                                                                                         | Add the missing sections, mirroring the JSON mistake list.                                                                                                            |
| P2-13 | `fuel-circuit` (`explanation.md:9,33`)                                                                                                                                                                                                                                                                 | The proof sentence "the tank at `j` is what remained after starting at `s` ... minus the fuel already used" mixes the failed run's remainder with the new run's empty tank. The common mistake "Using the station after the failure instead of the station where the failure occurred" is ambiguous because the algorithm itself uses `i + 1`.                                                                                                | Rewrite the proof in terms of the non-negative remainder, and name the indices explicitly: "using `i + 2` instead of `i + 1` after the balance goes negative at `i`." |
| P2-14 | `search-tree-check` (`explanation.md:27`)                                                                                                                                                                                                                                                              | The common mistake says "Using `<=` and `>=` in a way that accepts duplicates." The algorithm uses `<=` and `>=` to reject duplicates; using strict `<` and `>` would accept them.                                                                                                                                                                                                                                                            | Change to "Using strict `<` and `>` against the bounds, which accepts duplicates."                                                                                    |
| P2-15 | `paint-fill` (`statement.md:20-25`; `tests/sample.jsonl:1`)                                                                                                                                                                                                                                            | The statement's main example (`[[1,1,1],[1,1,0],[1,0,1]]`, `row=1`, `column=1`, `color=2`) is not in the sample tests. Sample 1 starts from the already-painted output with `color=2`.                                                                                                                                                                                                                                                        | Add the statement example to `sample.jsonl`.                                                                                                                          |
| P2-16 | Designs (`design.json` requirements; `rubric.json`)                                                                                                                                                                                                                                                    | Several non-functional requirements are not measurable ("redirects should be fast", "low latency", "keep feed reads fast", "strongly consistent"). The rubric dimension names also split into two families: four use `scale`/`failure-modes`; four use `estimation`/`api-data-model`/`deep-dives`/`communication`. The authoring guide names one seven-dimension scheme.                                                                      | Give each design at least one numeric latency/availability target, and normalise the rubric IDs/names to the authoring guide (or document the two schemes).           |
| P2-17 | Lessons: `sorting` (`lesson.json`), `binary-search` (`lesson.md:70-79`), `greedy-and-intervals` (`lesson.json`), `requirements-and-estimation` (`lesson.md:71`)                                                                                                                                        | Complexity qualifications are inconsistent: quicksort space is `O(log n)` without the `O(n)` worst case; the rotated-array rule does not say it requires distinct values; maximum-meetings space is `O(1)` without the sort caveat; the estimation lesson's `12 TB` implies about 10% overhead while the reference lesson says 20–50%.                                                                                                        | Add average/worst-case qualifiers and state the sorting and overhead assumptions.                                                                                     |
| P2-18 | Lessons: `matrix-traversal` (`lesson.md:17`), `consistency-and-idempotency` (`lesson.md:28-39`), `message-queues-and-observability` (`lesson.md:98-105`), `availability-and-failover` (`lesson.md:87,124`), `security-basics` (`lesson.md:36`), `real-world-architectures` (`lesson.md:26-41,135-137`) | Clarity polish: "works on a square matrix" reads as correct rather than transposed; CAP/CP/AP are never expanded; the trace sample has no root/total and shows a 61 ms database child under a 12 ms API span; RPO is conflated with the actual data-loss gap; HSTS is described as a preference rather than an enforced policy; CQRS is named but not defined, and the skeleton draws DNS as a request hop and the queue as a database child. | Fix each wording/diagram; add one-line definitions and a root span.                                                                                                   |
| P2-19 | `real-world-architectures` (`lesson.json:104`; `lesson.md:178`)                                                                                                                                                                                                                                        | The System Design Primer attribution says "CC BY 4.0" but gives no URL to the primer or the license. `docs/authoring/lesson-authoring.md:139-143` asks for a descriptive note and a link.                                                                                                                                                                                                                                                     | Add `https://github.com/donnemartin/system-design-primer` and the CC BY 4.0 URL.                                                                                      |

---

# What passed

## Designs (8/8)

- All eight prompts are original, self-contained, and scoped; each states functional requirements, non-functional requirements, scale, and deliverables.
- Each rubric has exactly seven dimensions with four concrete levels (checked programmatically).
- Each `design.json` has `license` and `attribution`; each has a 7-item checklist and 3–5 follow-up questions.
- Each reference explains request/data flow, storage choices, failure handling, and trade-offs, and acknowledges alternatives.
- The expected-topic checklist matches the prompt and reference.
- The only design-level accepted gap is the missing optional Excalidraw scenes (B8), which is already recorded in the packet. The Markdown references are usable without them.

## Lessons (39/39)

- Every lesson has `lesson.md`, `lesson.json`, `license`, and `attribution`.
- Every linked exercise exists in `pack.json` and on disk; every lesson links at least two exercises, and at least one directly practices the lesson's central idea.
- Diagrams are fenced `text`/ASCII, with no remote images, and were readable at the review width.
- Self-check answers are correct except `trees` #2 (P0-07); the rest were verified.
- Lesson prose, diagrams, and worked examples appear original. No copied lesson prose or table was found.
- The system-design lessons use the System Design Primer as a topic checklist, not as a text source; the attribution is present (URL gap: P2-19).

## Coding problems (81/81)

- Every problem has `license` and `attribution`.
- Method names, parameter order, return types, and checkers are consistent with the references; the 162 reference solutions pass every sample and hidden test.
- Sample counts are 3–5 and hidden counts are 15–39, matching the inventory.
- Hints levels 1–3 contain no code or pseudocode; level 4 is the first place code/pseudocode appears.
- Explanations generally state time and space complexity and list specific mistakes.
- Edge-case coverage is strong on small inputs: empty, single-element, duplicates, negatives, and bounds are common.
- The automated validator, reference tests, and typecheck pass.

---

# Originality and license assessment

- **Problem titles:** Renamed and descriptive (`Pair Sum`, `Water Between Walls`, `Island Count`, etc.). No LeetCode/NeetCode trademark appears in a title. The `leetcodeSlug` field on `pair-sum` is an optional convenience link, not a title.
- **Collection name:** "Grind 75" is a public list name, used descriptively with an attribution to Tech Interview Handbook and a URL. This is consistent with the policy.
- **Problem examples/tests:** Not original for at least 76 of 81 problems. This contradicts `NOTICE`, `CONTENT_LICENSE`, `pack.json:146`, and every "Original problem" attribution. P0-01.
- **Lesson prose/diagrams:** Appear original. The System Design Primer is used as a coverage checklist; no primer text or diagram was found. The only attribution gap is the missing URL (P2-19).
- **Design prompts/references:** Appear original; they are standard system-design scenarios but the prose and numbers are Base Case's own.
- **License fields:** Present on all 128 items. The fields are not accurate for the copied examples/tests. The pack's CC BY-SA 4.0 notice cannot cover LeetCode-owned example text.
- **External services:** No separate plagiarism service was used. The review itself was performed by an in-editor AI agent; see the limitations below.

---

# Limitations

- This is an **AI-assisted review**, not a human second-person sign-off. The form records the reviewer as a Zed coding agent. If the project's process requires a human reviewer, a human must re-run the checklist and sign; this report can serve as the input.
- The eight designs, 39 lessons, and 81 coding items were all read, but coding and lesson batches were split across parallel passes. P0 findings and the material P1 findings were re-checked directly by the lead reviewer; lower-severity items are from the batch passes.
- The Electron app was not launched. The review used the Markdown/JSON source, the CLI validator, and the reference test runner, which the packet permits ("opening the app is optional").
- The originality assessment is based on recognition plus spot checks against public mirrors (for example, LeetCode 1 and 42), not a forensic comparison of every hidden test against every public source. The finding is stated as "at least 76 of 81"; the true count may be higher.
- Some P2 items are judgment calls about pedagogy and wording, not contract violations.

---

# Recommended remediation order

1. **P0-01:** Replace copied examples and sample tests; audit hidden tests; correct the originality/license claims. This is the release blocker.
2. **P0-02–P0-07:** Fix the two invalid/contradictory test suites, the `expression-calc` grammar, and the three lesson errors.
3. **P1-01–P1-12:** Fix the code/test contract and complexity issues; add performance-marked cases.
4. **P1-13–P1-23:** Align the lesson prose with the exercises and rubrics.
5. **P2:** Polish pass.
6. Re-run `pnpm content:validate`, `pnpm content:test`, and `pnpm typecheck`; ask the reviewer to recheck only changed items; update `PROGRESS.md` B4 and `docs/project/open-blockers.md`.
