# Content policy and legal rules

These rules are non-negotiable for a public open-source project.

## Originality

1. Do not copy LeetCode statements, examples, constraints, test cases, or
   editorial prose. The same rule applies to lessons: write your own
   explanations, analogies, diagrams, and worked examples.
2. Do not scrape LeetCode. No browser extension, automated fetch, or bundled
   scraped data.
3. Do not use LeetCode, NeetCode, Blind 75, or other trademarks in the app name,
   logo, or problem titles. Refer to lists descriptively and link out.
4. Write original statements. The underlying algorithm or idea is not
   copyrightable; the expression is. Use different framing, examples, and tests.
5. Do not copy test cases from another judge. Generate your own and validate
   them with independent solutions.
6. Lesson diagrams and worked examples are content. Do not trace or reproduce
   another course's diagrams, even if the underlying algorithm is the same.
7. Attribute open-license sources. If you adapt an Exercism or other MIT/CC
   problem, follow its license and attribution requirements.
8. Contributors must attest ownership through the DCO sign-off and the content
   PR checklist.
9. Keep the importer disclaimer: users are responsible for content they import.
10. Consult a lawyer before commercial launch. This document is not legal
    advice.

## Trademark-safe naming

- Working name: Base Case (provisional).
- Avoid "Leet," "LeetCode," "NeetCode," and confusingly similar marks.
- Use "Open on LeetCode" links only as a convenience; do not imply affiliation.
- Use generic list names with attribution notes.

## Licenses

- Code: MIT (`LICENSE`).
- Original content: CC BY-SA 4.0 (`CONTENT_LICENSE`).
- Third-party assets: record in `NOTICE`; comply with the source license.
- Every problem and design file must carry `license` and `attribution` fields.

## Imported content

The MVP importer:

- accepts a folder or zip;
- validates `pack.json`, schemas, IDs, licenses, and tests;
- previews pack name, item count, languages, license, and warnings;
- installs into `userData/content/packs/<id>`;
- marks the pack "Unverified" in the UI;
- shows: "You are responsible for content you import. The app does not verify
  legality or correctness.";
- rejects native code and unsupported checker types;
- allows uninstall without deleting user attempts.

Do not build a LeetCode URL importer, a browser scraper, an unmoderated
marketplace, or a native plugin system.

## Content review

Every content PR needs:

- CI green (`validate`, reference tests, lint);
- one maintainer review for technical correctness;
- one review for clarity/ambiguity (the same person is acceptable for alpha,
  not for MVP);
- a license/attribution check;
- confirmation that no text or tests were copied;
- a test run in the app, not only the CLI.

## Review checklist

- [ ] Statement is original and self-contained.
- [ ] Lesson prose, diagrams, and worked examples are original.
- [ ] Examples match the tests.
- [ ] Constraints are sufficient.
- [ ] Signature matches the reference solutions.
- [ ] All reference solutions pass all tests.
- [ ] Tests are deterministic.
- [ ] Performance tests are calibrated.
- [ ] Hints do not leak full code before level 4.
- [ ] Explanation is correct.
- [ ] Lesson links at least one existing exercise.
- [ ] License/attribution present.
- [ ] No LeetCode text or test data.

## Takedown

If you believe content infringes your rights, open a private security/contact
issue or email the maintainer listed in `SECURITY.md`. Include the problem ID,
the source, and the specific material. Valid reports are handled promptly;
offending content is removed while the report is reviewed.
