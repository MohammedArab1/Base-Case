# Alpha release runbook

This is the checklist and process for the `0.1.0-alpha` release and the private
beta that follows it. It complements `open-blockers.md`; the blockers there still
need an owner and external access.

## Release goal

A public alpha that a real user can install on macOS or Windows, complete
onboarding, solve a coding problem, draw a design, review a card, and export
their data without help and without a network connection.

Exit criteria from `PLAN.md`:

- Clean install works on macOS and Windows.
- Offline mode works.
- At least 70% of testers complete onboarding.
- No data loss.
- P0 bugs are fixed or documented.

## Version and tag

- App version: `0.1.0-alpha` in the root and desktop `package.json` files.
- Git tag: `v0.1.0-alpha`.
- The tag triggers the `Build installers` workflow. The workflow uploads
  unsigned macOS and Windows artifacts and a `SHA256SUMS.txt` file.

## Release checklist

### Before tagging

- [ ] `pnpm format:check && pnpm lint && pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm content:validate && pnpm content:test`
- [ ] `pnpm judge:build && pnpm build && pnpm smoke:e2e`
- [ ] `pnpm smoke:playwright`
- [ ] `pnpm evals` (mock provider; a real-model run is B3)
- [ ] macOS package built and launched: `CSC_IDENTITY_AUTO_DISCOVERY=false pnpm package:mac`
- [x] Windows package built through the manual `Build installers` workflow (B2: run `40607714499`; installed and launched on Windows 11)
- [x] Clean install works on macOS and Windows (B1 closed by owner waiver for the alpha: Windows hardware install passed; clean-OS isolation was not performed and remains a v1.0 bar)
- [ ] `CHANGELOG.md` has a dated `0.1.0-alpha` section
- [ ] `README.md` status and `PROGRESS.md` reflect the release
- [ ] `docs/quickstart.md`, `faq.md`, `privacy.md`, and `known-limitations.md` are
      linked from `docs/README.md`
- [ ] Diagnostics self-test passes on both platforms
- [ ] No uncommitted changes; `main` is pushed

### Tag and publish

```sh
git tag -a v0.1.0-alpha -m "Base Case 0.1.0-alpha"
git push origin v0.1.0-alpha
```

1. Open **Actions → Build installers**, wait for both matrix jobs to pass.
2. Download the `base-case-macOS` and `base-case-Windows` artifacts.
3. Verify `SHA256SUMS.txt` against the downloaded files.
4. Create a GitHub Release for the tag. Attach the DMG, ZIP, EXE, and
   `SHA256SUMS.txt`.
5. Paste the release notes from the template below.
6. Mark the release as a pre-release.
7. Post the install instructions and the feedback issue link in the beta channel.

### Release notes template

```md
Base Case 0.1.0-alpha is a local-first coding interview and system design
practice app for macOS (Apple Silicon and Intel) and Windows.

What works: 81 original coding problems (including a 75-problem Grind 75
collection), 8 design scenarios, 39 offline DSA and system-design lessons with
linked practice, a local Python and TypeScript judge, hints and explanations,
FSRS review, a design canvas with Markdown/PNG export, data export/import,
accessible core flows, and an optional experimental AI tutor with explain-back,
lesson clarification, and confirmed mistake tags (off by default).

Install: see docs/quickstart.md. macOS builds are ad-hoc signed but not
notarized; the first launch needs System Settings → Privacy & Security → Open
Anyway. Windows SmartScreen will also warn. Verify SHA256SUMS.txt before running.

Known limitations: docs/known-limitations.md. Report bugs with the diagnostics
report from Settings → Diagnostics.

No telemetry. Your data stays on your machine.
```

## Private beta

Target 10–30 users. Prefer a mix of interview candidates, career switchers, and
at least two people who use Windows as their primary machine.

### Recruiting

- Invite from the maintainer's network and relevant communities.
- Ask for one 30-minute onboarding call in the first week.
- Do not require an account, email list, or telemetry. Collect feedback through
  GitHub issues and an optional short survey.

### Onboarding script (30 minutes)

1. Ask the tester to install from the release page without help.
2. Watch where they hesitate. Do not explain the UI unless they are blocked.
3. Ask them to complete onboarding and solve Pair Sum.
4. Ask them to open one design scenario and submit a text-only attempt.
5. Ask them to run Settings → Diagnostics and read the result.
6. Ask: what was confusing, what felt unnecessary, and would you use this again?
7. Record the platform, build, and whether onboarding completed without help.

### Weekly cadence

- Monday: triage new issues, assign P0/P1, update the milestone.
- Wednesday: ship fixes to `main`; rebuild installers from a tag only when a P0
  fix is ready.
- Friday: post a short summary in the beta channel and update `PROGRESS.md`.

## Feedback and triage

Use the **Alpha feedback** issue form for open-ended feedback and the **Bug
report** form for defects. Ask for the diagnostics report and the app version,
but never for API keys, notes, or code they do not want to share.

### Priority definitions

| Priority | Definition                                                    | Response                                          |
| -------- | ------------------------------------------------------------- | ------------------------------------------------- |
| P0       | Data loss, security issue, app cannot start, judge cannot run | Fix or document immediately; block the next build |
| P1       | Core loop blocked for a platform or a common setup            | Fix in the next weekly build                      |
| P2       | Annoyance, copy issue, edge case, nice-to-have                | Backlog with a milestone                          |
| P3       | Question or duplicate                                         | Answer and close                                  |

### Triage checklist

- [ ] Reproduced on the reported platform and build
- [ ] Classified P0–P3 and labeled `area:*` plus `priority:*`
- [ ] Diagnostics report attached or requested
- [ ] Workaround documented if the fix will take more than one week
- [ ] Added to the alpha milestone if P0/P1

## Metrics

The app has no telemetry. These metrics come from the beta calls, the feedback
form, and opt-in data exports. Record them in the alpha summary, not per user.

| Metric              | Definition                                                                    | Source                                   |
| ------------------- | ----------------------------------------------------------------------------- | ---------------------------------------- |
| Activation          | Tester completes onboarding and submits one coding attempt without help       | Onboarding call or feedback form         |
| Retention           | Tester opens the app on a second day within seven days                        | Feedback form or follow-up               |
| Judge failure rate  | Failed judge runs divided by all judge runs, excluding expected wrong answers | Opt-in diagnostics and exported attempts |
| Content errors      | Reports where a statement, test, hint, or reference is wrong                  | Content issues                           |
| AI helpfulness      | Share of AI feedback marked helpful, per feature                              | Local AI feedback and the eval harness   |
| Crash / start fails | Reports where the app or judge does not start                                 | Bug reports                              |

For a tester who opts in, ask them to use **Settings → Backup and transfer →
Export data**. The export excludes API keys. Do not collect exports by default.

## After the beta

- Write a short alpha summary: activation, retention, top five issues, and the
  P0/P1 list.
- Update `PROGRESS.md` with the outcome and move Phase 8 to Done only when the
  exit criteria are met.
- Keep the `0.1.0-alpha` tag; publish a new tag for each build rather than moving
  an existing one.
