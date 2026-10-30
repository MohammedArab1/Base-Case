# GitHub project setup

**Status: closed by owner decision (2026-10-30).** The repository is intentionally
kept as a simple public code repository for now. Do not create milestones, extra
labels, a project board, or repository-setting changes unless the project later
adopts a community workflow. This document is retained as a future checklist.

`gh` is installed (`2.103.3`) but not authenticated. If B6 is reopened, authenticate
it (or use the GitHub web UI) and configure milestones, labels, and the project
board from this document.

## Milestones

Create one milestone per phase:

| Milestone                             | Scope                                                     |
| ------------------------------------- | --------------------------------------------------------- |
| Phase 0 — Decisions and project setup | Repo, CI, licenses, ADRs, templates                       |
| Phase 1 — Technical spike             | Electron, Go judge, editor, canvas, SQLite, AI, packaging |
| Phase 2 — App foundation              | Shell, IPC, design system, storage, content loader        |
| Phase 3 — Judge engine                | Runtimes, harnesses, limits, sandbox, conformance         |
| Phase 4 — Coding practice             | Problem list, workspace, hints, FSRS                      |
| Phase 5 — System design               | Canvas, notes, rubric, reference                          |
| Phase 6 — AI tutor                    | Providers, context, features, guardrails, evals           |
| Phase 7 — Content production          | 10 coding + 4 design for alpha                            |
| Phase 8 — Alpha release               | Installers, docs, beta                                    |
| Phase 9 — MVP expansion               | 81 + 8 content, 39 lessons, importer, polish              |
| Phase 10 — v1.0 release               | Stable release and community                              |

## Labels

| Label                   | Use                                    |
| ----------------------- | -------------------------------------- |
| `area:app`              | Electron shell, UI, settings           |
| `area:judge`            | Protocol, runtimes, harnesses, sandbox |
| `area:content`          | Problems, designs, tests, packs        |
| `area:ai`               | Providers, prompts, evals              |
| `area:design`           | System design workspace                |
| `area:docs`             | Documentation                          |
| `area:ci`               | Build, test, release automation        |
| `type:bug`              | Defect                                 |
| `type:feature`          | New capability                         |
| `type:feedback`         | Alpha user feedback                    |
| `type:chore`            | Maintenance                            |
| `type:security`         | Security-sensitive work                |
| `good first issue`      | Small, well-scoped contribution        |
| `help wanted`           | Maintainer welcomes a contributor      |
| `blocked`               | Waiting on a decision or dependency    |
| `needs:content-review`  | Content requires a second reviewer     |
| `needs:security-review` | Security-sensitive change              |
| `priority:P0`           | Must ship / blocks a phase             |
| `priority:P1`           | Important, can slip one phase          |
| `priority:P2`           | Nice to have                           |

## Suggested `gh` commands

```sh
# Labels
gh label create "area:app" --color 1D76DB --description "Electron shell, UI, settings"
gh label create "area:judge" --color 5319E7 --description "Protocol, runtimes, harnesses, sandbox"
gh label create "area:content" --color 0E8A16 --description "Problems, designs, tests, packs"
gh label create "area:ai" --color B60205 --description "Providers, prompts, evals"
gh label create "area:design" --color D4C5F9 --description "System design workspace"
gh label create "area:docs" --color FBCA04 --description "Documentation"
gh label create "area:ci" --color 006B75 --description "Build, test, release automation"
gh label create "good first issue" --color 7057FF --description "Small, well-scoped contribution"
gh label create "help wanted" --color 008672 --description "Maintainer welcomes a contributor"
gh label create "needs:content-review" --color F9D0C4 --description "Content requires a second reviewer"
gh label create "type:security" --color B60205 --description "Security-sensitive work"
gh label create "type:feedback" --color C2E0C6 --description "Alpha user feedback"

# Milestones
gh api repos/:owner/:repo/milestones -f title="Phase 0 — Decisions and project setup"
# ...repeat for Phases 1–10.
```

## Project board

Columns:

1. **Backlog** — not scheduled.
2. **Ready** — scoped and unblocked.
3. **In progress** — one item at a time.
4. **Review** — PR open, CI running.
5. **Done** — exit criteria met and `PROGRESS.md` updated.

Seed the board with Phase 0–2 issues from `PLAN.md` Section 13 and the epics in
Section 14. Each issue needs acceptance criteria and a phase label.

## Repository settings

- Require CI to pass before merge.
- Require one review for code and content PRs.
- Enable Dependabot alerts and security updates.
- Enable private vulnerability reporting.
- Protect `main`: no force pushes, no direct pushes once contributors join.
- Enable GitHub Discussions for roadmap and feature ideas.
- Disable the wiki; keep docs in the repository.
