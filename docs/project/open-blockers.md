# Open blockers and external dependencies

Last reviewed: 2026-10-27

This is the single list of work that cannot be completed from the repository alone.
Update it whenever a blocker is resolved or a new one appears. `PROGRESS.md` links
here from its Blockers section.

| ID  | Blocker                                     | Why it blocks                                                                                                                                                                                                  | What unblocks it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Status                    |
| --- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| B1  | Clean-VM installs                           | Phase 1 exit criteria require installing the macOS DMG and Windows installer on clean machines and recording the result. No clean VM is available in this environment.                                         | Closed by owner waiver on 2026-10-27 after hardware verification. Windows install passed with bundled runtimes; clean-OS isolation was explicitly accepted for the alpha. See “Resolved evidence” below.                                                                                                                                                                                                                                                                                                                                                                | Closed (waiver)           |
| B2  | Manual Windows installer workflow           | The `Build installers` GitHub Actions workflow must be triggered manually to confirm the bundled-runtime `.exe` size and that the packaged app starts.                                                         | Build installers run `40607714499` succeeded; the Windows installer launched and passed diagnostics. See “Resolved evidence” below.                                                                                                                                                                                                                                                                                                                                                                                                                                     | Done                      |
| B3  | Real-model AI eval run                      | The bug-zoo baseline uses the deterministic mock provider. The Phase 6 exit criteria need a real model, human-rated diagnosis correctness, and human-rated helpfulness.                                        | Completed on 2026-10-28 with `deepseek-v4.1-flash`: 59/60 cases reviewed, 100% diagnosis accuracy, 4.9/5 helpfulness, 0 leaks, and one documented provider truncation. See “Resolved evidence” below.                                                                                                                                                                                                                                                                                                                                                                   | Done (59/60)              |
| B4  | Second-person content review                | Phase 7 exit criteria require two reviewers to sign off. The current 81 coding problems, 8 design scenarios, and 39 lessons have automated validation and reference-solution runs, but only one author review. | Full-tier AI-assisted review completed 2026-10-29; all 7 P0, 23 P1, and 19 P2 findings plus recheck residuals R1–R3 were fixed and rechecked at `af4ba7f`. `content:validate` valid, `content:test` 162/162, `typecheck` and `format:check` pass. The repository owner accepted the provenance audit and waived the independent human second-person requirement for the alpha (remains a v1.0 bar); originality claims restored. Evidence: `docs/project/content-review-form.md`, `docs/project/content-review-findings.md`, and `docs/project/content-remediation.md`. | Done (owner waiver)       |
| B5  | Trademark search and domain                 | The working name may conflict with existing software/training uses, but the repository is a public GitHub project with no aggressive marketing.                                                                | **Closed by owner acceptance (2026-10-30):** keep the working name for now, do not register a domain, and rename on request if a concern is raised. Preliminary evidence: `docs/project/brand-clearance.md`. Revisit before any public branding campaign or commercial launch.                                                                                                                                                                                                                                                                                          | Closed (owner acceptance) |
| B6  | GitHub milestones, labels, and board        | The repository is intentionally kept as a simple public code repository for now; milestones, a project board, and extra labels are not needed for the current single-maintainer workflow.                      | **Closed by owner decision (2026-10-30):** keep the GitHub repository as is. Do not create milestones, labels, boards, or repository-setting changes unless the project later adopts a community workflow.                                                                                                                                                                                                                                                                                                                                                              | Closed (owner decision)   |
| B7  | Legal review before commercial launch       | `docs/authoring/content-policy.md` recommends legal review before commercial launch, but this is a non-commercial side project and public repository.                                                          | **Closed by owner acceptance (2026-10-30):** no commercial launch is planned; the owner accepts the legal risk and will remove or change content if a credible issue arises. No legal review was performed. Revisit before any commercial launch.                                                                                                                                                                                                                                                                                                                       | Closed (owner acceptance) |
| B8  | Optional reference Excalidraw scenes        | The eight design scenarios have Markdown reference designs but no optional `referenceScene` files. The validator emits warnings, not errors.                                                                   | **Closed by owner decision (2026-10-30):** reference scenes are not needed. Skip the optional diagrams; the Markdown reference, rubric, and checklist remain sufficient.                                                                                                                                                                                                                                                                                                                                                                                                | Closed (owner decision)   |
| B9  | Apple Foundation Models sidecar             | The Phase 6 stretch goal for an on-device `apple-fm` provider is not implemented. It is not required for the MVP.                                                                                              | **Closed by owner decision (2026-10-30):** optional stretch goal; do not build the Swift sidecar. Revisit only if on-device Apple-model support becomes a product goal.                                                                                                                                                                                                                                                                                                                                                                                                 | Closed (owner decision)   |
| B10 | Private alpha beta (10–30 users)            | Phase 8 previously listed a formal private beta with onboarding and retention targets.                                                                                                                         | **Closed by owner decision (2026-10-30):** no separate private beta program. The public repository and owner self-testing are sufficient for this side project; keep the beta runbook as optional guidance.                                                                                                                                                                                                                                                                                                                                                             | Closed (owner decision)   |
| B11 | Manual accessibility verification           | The automated axe gate passes; the remaining checklist requires a human at a real desktop.                                                                                                                     | **Closed by owner decision (2026-10-30):** manual VoiceOver/NVDA, zoom, forced-colors, and canvas checks are not required for this side-project alpha. The automated accessibility gate remains required; manual verification remains a v1.0 aspiration.                                                                                                                                                                                                                                                                                                                | Closed (owner decision)   |
| B12 | Apple Developer ID signing and notarization | The macOS build is ad-hoc signed and Gatekeeper requires per-app approval on first launch.                                                                                                                     | **Closed by owner decision (2026-10-30):** ad-hoc signing is accepted for the side-project alpha; no Apple Developer Program membership or notarization. Documented **Open Anyway** instructions remain. Revisit only for broad public distribution.                                                                                                                                                                                                                                                                                                                    | Closed (owner decision)   |

## Resolved evidence

### B1 — clean installs (owner waiver, 2026-10-27)

- Build tested: `0.1.0-alpha`, commit `72e9b4d`, Windows x64.
- Windows: installer `Base-Case-0.1.0-alpha-x64` installed on physical Windows 11 at `C:\Users\moham\AppData\Local\Programs\Base Case`. SmartScreen blocked the first launch; **More info → Run anyway** completed the install.
- Diagnostics: **9/9 checks passed**, 79 coding problems and 8 design scenarios, Node 24.22.0 and Python 3.12.15 both reported as **bundled**.
- Coding smoke: Pair Sum samples ran successfully in both Python and TypeScript.
- macOS: clean-OS isolation was not performed. The macOS package is built and verified on the development machine and in CI; the owner accepted this residual risk for the alpha.
- Scope: this waiver applies to the installed `0.1.0-alpha` build. Rebuild and rerun the packaged smoke test after the pending Learn/content changes before tagging.

### B2 — manual Windows installer workflow (done, 2026-10-27)

- Workflow: [Build installers run 40607714499](https://github.com/MohammedArab1/Base-Case/actions/runs/40607714499), success at commit `72e9b4d`.
- Artifacts: `base-case-Windows` (476.5 MiB ZIP) and `base-case-macOS` (1,028.3 MiB ZIP).
- Windows installer: `Base-Case-0.1.0-alpha-x64.exe`; installed and launched successfully with the diagnostics above.
- The exact `.exe` size was not captured separately from the artifact ZIP; the installer filename, artifact size, and first-launch result are recorded here.

### B3 — real-model AI eval (done, 2026-10-28)

- Endpoint and model: `https://opencode.ai/zen/go/v1`, `deepseek-v4.1-flash`.
- Revisions: full run `e69789d`; targeted retry `e1b8810`.
- Automated: 60 cases, 0 raw/guarded leaks, 0 warnings, 59 parsed, 1 provider failure.
- Human review: **30/30 explain diagnoses correct**, **59/60 cases reviewed**, **helpfulness 4.9/5** (explain 5.0, hint 4.79).
- Review method: AI-assisted review at the maintainer’s request, with the maintainer spot-checking a sample. Protocol: `docs/evals/README.md`.
- Results: `docs/evals/results-openai-compatible.json` (includes raw and guarded responses, ratings, and `humanSummary`).
- Unreviewed case: `linked-list-cycle-null-deref` hint was truncated by the provider at both 1200 and 2000 output tokens. It is documented as a provider failure, not marked correct.
- Label note: automated exact-label accuracy is 0 because the model emits more specific `bugType` names than the bug-zoo taxonomy. Human diagnosis accuracy is the B3 signal.

### B4 — second-person content review (owner waiver, 2026-10-30)

- Review: Full-tier AI-assisted review of 81 coding problems, 8 design scenarios, and 39 lessons (128 items).
- Findings: 7 P0, 23 P1, 19 P2. All fixed or documented; recheck residuals R1–R3 fixed at `ae8310e` and verified at `af4ba7f`.
- Checks: `pnpm content:validate` valid; `pnpm content:test` 162/162; `pnpm typecheck`; `pnpm format:check`.
- Owner acceptance: Mohammed Arab (repository owner and content author) accepted the provenance audit and restored the originality claims in `NOTICE`, `CONTENT_LICENSE`, `pack.json`, and all 81 problem attributions.
- Waiver: the independent human second-person sign-off was waived for the alpha, consistent with B1. A human second-person review remains a v1.0 requirement.
- Evidence: `docs/project/content-review-form.md`, `docs/project/content-review-findings.md`, and `docs/project/content-remediation.md`.

### B5 — preliminary brand clearance (2026-10-30)

- Preliminary research found a registered **BASECASE** service mark owned by Certara Germany GmbH (USPTO serial `77955079`, filed 2010-03-10) covering teaching/training in business, industry, and IT; Certara markets BaseCase® software.
- Other software uses: BaseCase Inc at `basecase.co`, Basecase at `basecase.app`, and Base Case, LLC at `getbasecase.com`.
- Registered domains include `basecase.com`, `.co`, `.io`, `.ai`, `.app`, `.net`, `.org`, `.xyz`, `.study`, `getbasecase.com`, and `trybasecase.com`. `basecase.dev` appeared unregistered but needs registrar confirmation. `github.com/basecase`, `github.com/base-case`, and `x.com/basecase` are taken.
- Recommendation: choose a new public brand unless formal counsel clearance supports keeping “Base Case” for public use. Full evidence and owner/legal checklist: `docs/project/brand-clearance.md`.
- **Owner decision (2026-10-30):** keep “Base Case” for the public GitHub repository for now; no domain registration or formal trademark clearance; no aggressive marketing; rename if a credible concern is raised. Accepted risk recorded rather than cleared.

### B6 — owner decision (2026-10-30)

- The repository remains a simple public code repository.
- No milestones, custom labels, project board, issue seeding, Discussions, wiki, branch-protection, or Dependabot changes will be made for now.
- `gh` was installed (`2.103.3`) during the investigation, but it is not used for this repository.
- Revisit only if the project adopts a multi-contributor/community workflow.

### B7 — legal review (owner acceptance, 2026-10-30)

- Scope: content license, third-party attribution, AI/privacy disclosures, and commercial launch.
- Owner decision: this is a non-commercial side project; no legal review will be commissioned. The owner accepts the risk and will remove or change content if a credible issue arises.
- Revisit before any commercial launch or paid distribution. This is an accepted risk, not a legal clearance.

### B9–B12 — owner decisions (2026-10-30)

- **B9:** optional Apple Foundation Models sidecar will not be built.
- **B10:** no formal private beta; public repository and owner testing are sufficient.
- **B11:** manual accessibility verification is not an alpha gate; automated axe coverage remains required, and the manual checklist remains a v1.0 aspiration.
- **B12:** ad-hoc signing is accepted; no Apple Developer Program or notarization for this side-project alpha. The documented first-launch **Open Anyway** flow remains.
- None of these are required to tag or use the alpha. Revisit only if the project moves toward broad public distribution or a commercial release.

### B8 — reference Excalidraw scenes (owner decision, 2026-10-30)

- Optional reference diagrams are not needed.
- The eight design scenarios keep their Markdown reference, rubric, and checklist; the validator warnings are accepted.
- No `referenceScene` files will be added.

## Verification commands for resolved blockers

- Clean-OS installs: record the owner waiver and hardware evidence in `PROGRESS.md`; clean-VM verification remains a v1.0 requirement.
- Windows installer: attach the workflow run URL, artifact size, and first-launch result.
- Real-model evals: `docs/evals/results-openai-compatible.json` with automated and human summaries; B3 closed 2026-10-28 at 59/60 reviewed.
- Content review: completed `docs/project/content-review-form.md` and `docs/project/content-review-findings.md`; see the B4 owner-waiver evidence below.
- Trademark/domain: record the search result and registrar.
- GitHub setup: link the project board.
- Private beta: link the alpha summary with activation, retention, and the P0/P1 list.
- Manual accessibility: record the reviewer, OS, date, and exceptions in `docs/project/accessibility.md`.
- Apple signing/notarization: record the Team ID, certificate type, notarization submission ID, and `spctl --assess` result.
