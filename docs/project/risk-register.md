# Risk register

Review monthly and before every release. Add a trigger action for each high
risk. This mirrors `PLAN.md` Section 15; update both when a risk changes.

| Risk                             | Likelihood | Impact | Mitigation                                                                           | Trigger                       |
| -------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------ | ----------------------------- |
| Content licensing problem        | Medium     | High   | Original content only; links; importer disclaimer; legal review before commercial    | Any copied text/test found    |
| Judge sandbox escape or accident | Medium     | High   | Threat model; temp dirs; network denial; conformance; document limits; microVM later | Security test failure         |
| macOS/Windows packaging pain     | High       | Medium | CI matrix early; clean VMs; runtime packs; unsigned docs                             | >1 week spent on packaging    |
| Electron size/memory             | Medium     | Medium | Budgets; profiling; optional Wails port later                                        | App > 500 MB or idle > 800 MB |
| Scope creep                      | High       | High   | Narrow MVP; phase gates; cut list                                                    | Alpha slips > 4 weeks         |
| Content authoring burnout        | High       | High   | Alpha 10+4; pipeline; contributors; AI-assisted drafts                               | <1 problem/week for 2 weeks   |
| AI quality too low               | Medium     | Medium | Bug zoo; pre-authored fallback; BYO providers; label experimental                    | Diagnosis <70%                |
| AI provider/key security         | Low        | High   | safeStorage; no renderer keys; no logs; preview                                      | Key appears in logs           |
| Apple FM sidecar delays          | Medium     | Low    | Post-MVP; optional; BYO key first                                                    | >1 week spike                 |
| Open-source maintenance burden   | Medium     | Medium | Docs, CI, templates, reviewers, good first issues                                    | >30 open issues               |
| Dependency/supply chain          | Medium     | Medium | Lockfiles, audit, Dependabot, minimal deps                                           | Critical CVE                  |
| Data loss                        | Low        | High   | WAL, backups, export, crash recovery tests                                           | Any lost attempt              |
| Unsigned install friction        | High       | Medium | Clear docs; checksums; signing later                                                 | >30% install failures         |
| Importer malicious content       | Low        | High   | Data-only; validate; warnings                                                        | Pack executes code            |

## Current high-risk triggers

- Phase 1 measured macOS cold start at 2.5 s first launch / 0.45 s warm, idle
  memory at ~265 MB, installer size at 190 MB, and judge overhead at ~30–54 ms
  per test. These are within budget; re-measure on Windows.
- Phase 1 must be completed on Windows: package the app, run the judge, and
  install on a clean VM.
- Phase 3 must prove process-group cleanup and output/memory limits on both
  platforms.
- Before public alpha, complete the name/trademark check and a content
  licensing review.
