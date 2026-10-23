# Definition of done

## A task is done when

- Code is reviewed and merged.
- Unit/integration tests pass.
- The feature works offline.
- The feature works on macOS and Windows, or has a documented limitation.
- Loading, empty, error, and offline states exist where relevant.
- Accessibility basics are covered: keyboard, focus, labels, contrast.
- No new P0/P1 bugs.
- Docs are updated (user-facing or developer-facing).
- No secrets in logs or code.
- Performance is within budget, or the exception is documented.
- `PROGRESS.md` is updated with the work, tests run, next action, and blockers.

## A phase is done when

- Its exit criteria in `PLAN.md` Section 13 are met.
- A demo has been recorded or run for the maintainer.
- The risk register and decision log are updated.
- `PROGRESS.md` reflects the new state.
- A short retrospective is recorded.

## A release is done when

- The release checklist in `PLAN.md` Section 12.5 is complete.
- Installers build on macOS and Windows.
- A clean-VM install and launch succeeds on both platforms.
- Checksums and release notes are published.
- Backup/export/import has been tested.
- The judge conformance suite passes on both platforms.
- No known P0/P1 security or data-loss issues remain.

## Never cut

- Judge correctness and safety.
- Data durability and backups.
- Offline core functionality.
- Content licensing checks.
- Accessibility basics.
- Install and contribution documentation.
- Tests for the judge and content.
