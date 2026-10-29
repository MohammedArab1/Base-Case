# Content review packet — B4

Prepared: 2026-10-28  
Commit to review: `ed7bddd` (confirm the exact commit in your handoff message)  
Content: **81 coding problems, 8 system-design scenarios, 39 lessons**  
Review type: independent second-person review for clarity, ambiguity, originality, and license/attribution.

This packet is for a reviewer who is **not the author**. The reviewer does not need write access to the repository and is not expected to fix content. The goal is a documented sign-off or a list of concrete findings.

## Why this review exists

B4 requires a second person to review the content before the alpha. Automated validation and reference-solution tests already pass; this review checks the things automation cannot:

- Is the problem or lesson understandable without outside context?
- Is anything ambiguous enough to produce a different valid answer?
- Is the prose, diagram, example, or test copied from another source?
- Are licenses and attributions present and accurate?
- Do the examples, tests, hints, and explanations agree with each other?

This is not a code-style review, a product-design review, or a re-authoring pass.

## Choose a review tier

The full set is 128 items. You do not have to review all of them for the alpha. Pick a tier and record it in the sign-off.

| Tier                   | Coding | Designs | Lessons |   Total | Estimated time | Use                                |
| ---------------------- | -----: | ------: | ------: | ------: | -------------: | ---------------------------------- |
| **T1 — alpha minimum** |     21 |       8 |       8 |  **37** |    2.5–3 hours | Recommended for the alpha sign-off |
| **T2 — thorough**      |     37 |       8 |      16 |  **61** |      4–5 hours | Use if you have a full afternoon   |
| **Full**               |     81 |       8 |      39 | **128** |    10–12 hours | v1.0-level review                  |

The inventory marks every item `[T1]`, `[T2]`, or `[Full]`. T1 is stratified to cover every major pattern, difficulty, and content type. **If you choose T2, review both `[T1]` and `[T2]` items; if you choose Full, review every row.** If only T1 is completed, record that clearly; the full review remains a v1.0 task.

## Before you start

1. Read:
   - `docs/authoring/content-policy.md`
   - `docs/authoring/problem-authoring.md`
   - `docs/authoring/design-authoring.md`
   - `docs/authoring/lesson-authoring.md`
2. Check out the commit in the handoff message.
3. If you have Node 24 and pnpm 12, run the automated checks:

   ```sh
   pnpm install
   pnpm content:validate
   pnpm content:test
   pnpm typecheck
   ```

   Expected: 81 coding problems, 8 designs, 39 lessons, and **162/162 reference solutions accepted**.

   If you cannot run them, use the recorded result in `PROGRESS.md` for the same commit and say so in the form.

4. You can review the Markdown and JSON in any editor or on GitHub. Opening the app is optional:

   ```sh
   pnpm dev
   ```

   Use the app for a few spot checks, not every item.

5. Do not paste unpublished content into external AI or plagiarism services. Use manual judgment and links to public sources.

## Review workflow

### 1. Designs first

Review all 8 designs (they are all T1). They are shorter than the coding set and calibrate the quality bar.

For each design, read:

- `content/packs/core/designs/<slug>/design.json`
- `prompt.md`
- `rubric.json`
- `reference.md`

### 2. Coding sample

Open `docs/project/content-review-inventory.md` and review the coding items marked for your tier.

For each problem, read:

- `statement.md`
- `problem.json`
- `hints.json`
- `explanation.md`
- `tests/sample.jsonl` and 2–3 hidden cases
- `solutions/python.py` and `solutions/typescript.ts`

You do not need to solve every problem. Read it as a learner and check that the intended answer is unambiguous.

### 3. Lessons

Review the lessons marked for your tier.

For each lesson, read:

- `lesson.md`
- `lesson.json`
- at least one linked exercise (open its folder or the app)

Check that the lesson teaches the idea before relying on it, the diagram is readable offline, and the self-check answers are correct.

### 4. Record findings as you go

Mark the item in the inventory and log any finding in `docs/project/content-review-form.md` or a GitHub issue using the template below. Do not fix the content in place unless the maintainer asks; a clean report is more useful.

## Coding checklist

- [ ] The title is original and does not use a trademarked problem name.
- [ ] The statement is self-contained and understandable without the explanation.
- [ ] The examples match the tests and do not give away the optimal approach.
- [ ] Constraints are sufficient to justify the intended complexity.
- [ ] The signature, method name, and `mutates` flags match the solutions.
- [ ] Hints 1–3 do not contain a full solution; level 4 is the first place code/pseudocode may appear.
- [ ] The explanation is correct, states time and space complexity, and lists specific mistakes.
- [ ] Tests are deterministic and include the important edge cases (empty, single element, duplicates, negatives, bounds).
- [ ] Hidden tests do not contradict the statement or the samples.
- [ ] License and attribution are present.
- [ ] No LeetCode or other copied statement, example, test, or editorial prose.

## Design checklist

- [ ] The prompt is original and self-contained.
- [ ] Functional requirements are testable; non-functional requirements have plausible targets.
- [ ] Scale numbers are plausible and internally consistent.
- [ ] The rubric has all seven dimensions with concrete, observable levels.
- [ ] The reference explains request/data flow, storage choices, failure handling, and trade-offs.
- [ ] Follow-up questions probe the hard parts, not trivia.
- [ ] The expected-topic checklist matches the prompt and reference.
- [ ] License and attribution are present.
- [ ] The Markdown reference is usable even though the optional Excalidraw scene is absent.

## Lesson checklist

- [ ] The explanation is original; no copied prose, example, table, or diagram.
- [ ] A beginner can follow it without prior context.
- [ ] The diagram is readable offline at 1024 px.
- [ ] Complexity is accurate and says average/amortized/worst case where it matters.
- [ ] Every linked exercise exists and is relevant.
- [ ] At least one exercise directly practices the lesson's central idea.
- [ ] Common mistakes are specific, not generic advice.
- [ ] Interview notes are actionable.
- [ ] Self-check answers are correct.
- [ ] License and attribution are present.

## Severity

Use these labels in the form:

| Severity | Meaning                                                                                                                                            | Sign-off effect                         |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **P0**   | Incorrect or contradictory content, ambiguous expected output, copied text/test, missing license, broken required link, or a test that cannot pass | Blocks sign-off until fixed             |
| **P1**   | Likely to block a learner or mislead them: unclear statement, wrong complexity, unreadable diagram, broken exercise link                           | Fix before release or explicitly accept |
| **P2**   | Polish: typo, awkward sentence, optional example improvement                                                                                       | Can ship; fix when convenient           |

A finding is only P0 if you can explain what a learner would get wrong or why the content cannot be used as published.

## Finding template

Copy this into `content-review-form.md` or a GitHub issue:

```md
### Content review finding

- Item:
- Path:
- Kind: coding / design / lesson
- Severity: P0 / P1 / P2
- Check: clarity / ambiguity / originality / license / tests / other
- Observation:
- Why it matters:
- Suggested change:
- Evidence or source (if applicable):
```

## What to send back

1. The completed `docs/project/content-review-form.md` with:
   - reviewer name/role and date;
   - commit reviewed;
   - tier and exact item counts;
   - automated checks run (or “used recorded result”);
   - findings summary and links;
   - decision.
2. Any separate issues or a link to the review PR/issue.
3. If you approve with exceptions, list each exception and its severity.

## Sign-off criteria

The reviewer can approve when:

- no P0 findings remain open;
- every P1 is fixed or explicitly accepted by the maintainer with a rationale;
- the reviewed tier and item count are recorded;
- automated checks pass at the reviewed commit, or the recorded result is referenced;
- the reviewer confirms they are not the author.

If only T1/T2 was reviewed, say so. Do not describe a sample as a full review.

## Handoff message

You can send this to the reviewer:

> Hi — could you do a second-person content review for Base Case, the offline interview-practice app? The packet is in `docs/project/content-review-packet.md`; the inventory is `docs/project/content-review-inventory.md`; the sign-off form is `docs/project/content-review-form.md`. You do not need to write code or fix anything. Review either the T1 sample (about 2.5–3 hours) or T2 (about 4–5 hours) for clarity, ambiguity, originality, and license/attribution. Run the automated checks if you have Node/pnpm; otherwise use the recorded result. Send back the completed form and any findings. Please don’t paste unpublished content into external AI or plagiarism services.

## After the review

The maintainer should:

1. Fix P0/P1 findings or record accepted exceptions.
2. Ask the reviewer to recheck only the changed items.
3. Update `PROGRESS.md` B4 with reviewer, date, commit, tier, and decision.
4. Update `docs/project/open-blockers.md` B4 status.
5. Re-run `pnpm content:validate` and `pnpm content:test` after any content fixes.

Known accepted gaps for this alpha:

- The eight design scenarios have Markdown references but no optional Excalidraw scenes (B8).
- The Grind 75 collection is a curated 75-problem subset of a public list that currently has more entries; see the attribution in `content/packs/core/pack.json`.
- The System Design Primer is used as a topic-coverage checklist, not as a text source; lessons are original prose and diagrams.
