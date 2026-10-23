# ADR-0008: License code under MIT and content under CC BY-SA 4.0

- Status: Accepted
- Date: 2026-10-23
- Deciders: Maintainer
- Supersedes: —

## Context

The project is open source and includes two different kinds of work: software
and educational content. Code should be easy to reuse and contribute to.
Original problems and explanations should remain open and share-alike so the
community cannot enclose improved versions. The working name is provisional and
has not completed a trademark search.

## Decision

- Code: MIT (`LICENSE`).
- Original content: Creative Commons Attribution-ShareAlike 4.0
  (`CONTENT_LICENSE`).
- Third-party assets and dependencies: recorded in `NOTICE`.
- Contributions: DCO sign-off (`git commit -s`), no CLA.
- Imported content: the importer shows a disclaimer and marks packs unverified;
  users are responsible for rights and correctness.
- No LeetCode statements, examples, constraints, tests, or trademarks are
  included.

The name "Base Case" is provisional. Do not invest in branding, domains, or
trademark filings until a search and final decision are recorded in
`PROGRESS.md`.

## Consequences

Positive:

- Simple, familiar code license.
- Content improvements stay available to the community.
- DCO lowers contribution friction compared with a CLA.
- Clear attribution and import rules reduce legal risk.

Negative:

- CC BY-SA is not appropriate for every contributor's employer policy; some
  content may need explicit permission.
- Share-alike adds obligations for derivative content packs.
- The provisional name may need to change before release.

## Alternatives considered

- **Apache-2.0 for code:** Better patent grant, but more ceremony than this
  project needs at the current stage.
- **CC BY 4.0 for content:** More permissive, but allows closed derivatives.
- **Public domain / CC0:** Does not preserve attribution or share-alike.

## Follow-up

- Complete a trademark/domain check before public alpha.
- Add a contributor attestation checkbox to the content PR template.
- Consult a lawyer before any commercial launch. This ADR is not legal advice.
