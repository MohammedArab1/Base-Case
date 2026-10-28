# Open blockers and external dependencies

Last reviewed: 2026-10-27

This is the single list of work that cannot be completed from the repository alone.
Update it whenever a blocker is resolved or a new one appears. `PROGRESS.md` links
here from its Blockers section.

| ID  | Blocker                                     | Why it blocks                                                                                                                                                                                                                                     | What unblocks it                                                                                                                                                                                                                            | Status          |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| B1  | Clean-VM installs                           | Phase 1 exit criteria require installing the macOS DMG and Windows installer on clean machines and recording the result. No clean VM is available in this environment.                                                                            | Closed by owner waiver on 2026-10-27 after hardware verification. Windows install passed with bundled runtimes; clean-OS isolation was explicitly accepted for the alpha. See “Resolved evidence” below.                                    | Closed (waiver) |
| B2  | Manual Windows installer workflow           | The `Build installers` GitHub Actions workflow must be triggered manually to confirm the bundled-runtime `.exe` size and that the packaged app starts.                                                                                            | Build installers run `40607714499` succeeded; the Windows installer launched and passed diagnostics. See “Resolved evidence” below.                                                                                                         | Done            |
| B3  | Real-model AI eval run                      | The bug-zoo baseline uses the deterministic mock provider. The Phase 6 exit criteria need a real model, human-rated diagnosis correctness, and human-rated helpfulness.                                                                           | An OpenAI-compatible endpoint (Ollama, LM Studio, or a cloud key) plus a reviewer. Run `pnpm evals` with `BASE_CASE_EVAL_PROVIDER=openai-compatible`, then fill the `diagnosisCorrect` and `helpfulness` fields.                            | Open            |
| B4  | Second-person content review                | Phase 7 exit criteria require two reviewers to sign off. The current 81 coding problems, 8 design scenarios, and 39 lessons have automated validation and reference-solution runs, but only one author review.                                    | A second reviewer for clarity, ambiguity, originality, and license/attribution. Use the checklist in `docs/authoring/content-policy.md`.                                                                                                    | Open            |
| B5  | Trademark search and domain                 | The name “Base Case” is confirmed as the working name, but no trademark search or domain registration has been done.                                                                                                                              | A basic trademark search and domain registration before public branding.                                                                                                                                                                    | Open            |
| B6  | GitHub milestones, labels, and board        | `gh` is not installed in this environment.                                                                                                                                                                                                        | Create milestones for Phases 0–10, labels, and a project board using `docs/project/github-setup.md` through the web UI or a token-based script.                                                                                             | Open            |
| B7  | Legal review before commercial launch       | `docs/authoring/content-policy.md` requires consulting a lawyer before commercial launch. This does not block engineering or the open-source alpha.                                                                                               | A legal review of the license, content policy, and AI/privacy disclosures.                                                                                                                                                                  | Open            |
| B8  | Optional reference Excalidraw scenes        | The eight design scenarios have Markdown reference designs but no optional `referenceScene` files. The validator emits warnings, not errors.                                                                                                      | Author and attach eight Excalidraw scenes, or accept the warnings for the alpha.                                                                                                                                                            | Open (optional) |
| B9  | Apple Foundation Models sidecar             | The Phase 6 stretch goal for an on-device `apple-fm` provider is not implemented. It is not required for the MVP.                                                                                                                                 | Build the Swift sidecar and availability checks in a macOS-only follow-up, or keep it post-MVP.                                                                                                                                             | Open (optional) |
| B10 | Private alpha beta (10–30 users)            | Phase 8 exit criteria include 70% onboarding completion, no data loss, and fixing P0/P1 bugs from real users. This requires recruited testers and their feedback.                                                                                 | Recruit 10–30 testers, run the onboarding script in `docs/project/alpha-release.md`, and record the weekly triage and alpha summary.                                                                                                        | Open            |
| B11 | Manual accessibility verification           | The automated axe gate passes, but VoiceOver/NVDA, 200% zoom, forced colors, canvas keyboard fallback, and the new lesson reading and AI-preview flows need a human at a real desktop.                                                            | Run the checklist in `docs/project/accessibility.md` on macOS and Windows and record the reviewer, date, and exceptions.                                                                                                                    | Open            |
| B12 | Apple Developer ID signing and notarization | The macOS build is ad-hoc signed but not notarized, so Gatekeeper requires the per-app **Open Anyway** approval and shows “Apple could not verify…” on first launch. The plan does not require signing for the MVP, but smooth distribution does. | Apple Developer Program membership, a Developer ID Application certificate, an app-specific notary credential, and a release machine/keychain. Configure signing and notarization in the build workflow, then staple and verify the ticket. | Open (post-MVP) |

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

## Verification commands for resolved blockers

- Clean-OS installs: record the owner waiver and hardware evidence in `PROGRESS.md`; clean-VM verification remains a v1.0 requirement.
- Windows installer: attach the workflow run URL, artifact size, and first-launch result.
- Real-model evals: `pnpm evals`, then review `docs/evals/results-openai-compatible.json`.
- Content review: link the review PR or comment in `PROGRESS.md`.
- Trademark/domain: record the search result and registrar.
- GitHub setup: link the project board.
- Private beta: link the alpha summary with activation, retention, and the P0/P1 list.
- Manual accessibility: record the reviewer, OS, date, and exceptions in `docs/project/accessibility.md`.
- Apple signing/notarization: record the Team ID, certificate type, notarization submission ID, and `spctl --assess` result.
