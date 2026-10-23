# Code review checklist

## Correctness

- [ ] The change does what the issue says, no more and no less.
- [ ] Edge cases and error paths are handled.
- [ ] State transitions are explicit; no hidden global state.
- [ ] Tests cover the behavior, not just the happy path.

## Security

- [ ] Renderer input is treated as untrusted; IPC payloads are validated.
- [ ] No Node/fs/process access from the renderer.
- [ ] No API keys, tokens, or absolute home paths in logs, code, or fixtures.
- [ ] User code paths still enforce temp dirs, limits, and process-group kill.
- [ ] Content packs remain data-only; no native or arbitrary checker code.
- [ ] External links open in the system browser; navigation is blocked.

## Offline and durability

- [ ] No core action blocks on the network.
- [ ] Database writes are transactional where needed.
- [ ] Autosave and shutdown flush pending work.
- [ ] Migrations are append-only and tested from an empty and previous schema.
- [ ] Backups are verified before pruning.

## UX and accessibility

- [ ] Loading, empty, error, and offline states are present.
- [ ] Keyboard navigation works; focus is visible.
- [ ] Icon-only buttons have labels.
- [ ] Status is not conveyed by color alone.
- [ ] Reduced motion is respected.
- [ ] Text contrast meets 4.5:1.

## Performance

- [ ] No obvious N+1 queries or unbounded work on the UI thread.
- [ ] Large content/test files stream or are capped.
- [ ] Changes stay within the budgets in `PLAN.md` Section 11.3.

## Content changes

- [ ] Original content only; no copied statements, examples, or tests.
- [ ] License and attribution are present.
- [ ] Reference solutions pass every test.
- [ ] Tests are deterministic and independent.
- [ ] Hints do not leak full code before level 4.

## Documentation and status

- [ ] User-facing or developer-facing docs are updated.
- [ ] `PROGRESS.md` is updated.
- [ ] Decisions that are expensive to change are recorded as an ADR.
