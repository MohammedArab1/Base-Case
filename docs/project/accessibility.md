# Accessibility review — Phase 9

Last reviewed: 2026-10-25
Target: WCAG 2.1 A/AA for the core desktop workflow.

## Automated gate

`apps/desktop/e2e/app.spec.ts` runs axe-core against six main views — Today,
Coding, System Design (including an open scenario and the Excalidraw canvas),
Review, Progress, and Settings — and a second test covers onboarding, the
command palette, forced-colors mode, and reduced motion. The tests fail on any
`serious` or `critical` violation for the `wcag2a`, `wcag2aa`, `wcag21a`, and
`wcag21aa` rule sets.

```sh
pnpm --filter @base-case/desktop build
pnpm --filter @base-case/desktop exec playwright test -g "accessibility|forced colors"
```

Current result: **pass**, including the keyboard skip link, the design canvas,
forced-colors emulation, and the reduced-motion transition check.

## Implemented controls

- Skip-to-content link as the first focusable element; the main landmark receives
  focus after activation.
- Visible focus rings for buttons and links, plus component-level
  `focus-visible` styles for inputs and the inspector resize handle.
- Landmarks and labels: primary navigation, main workspace labelled by its
  heading, labelled form controls, named dialogs, a labelled command listbox, and
  a labelled inspector.
- Third-party canvas: the Excalidraw main-menu trigger receives an accessible
  name when the canvas mounts.
- Status announcements: notes save state uses `role="status"` and
  `aria-live="polite"`; AI result panels and diagnostics use visible text.
- Charts: the 14-day activity chart exposes each day's count through
  screen-reader-only text and a group label; pattern bars retain text counts.
- Reduced motion: a global `prefers-reduced-motion: reduce` rule collapses
  animations and transitions; the Playwright check asserts the computed
  transition duration.
- Forced colors: the brand mark switches to system `Canvas`/`CanvasText` colors,
  and the forced-colors axe pass is clean.
- Color contrast: the sidebar version and empty-state hint labels no longer
  reduce opacity; axe reports no serious contrast violations in the audited
  views.
- Keyboard access: command palette supports arrow keys, Enter, Escape, and
  focus return; tabs use Radix primitives with keyboard semantics.

## Manual checklist before v1.0

These require a human at a real desktop and are not covered by the automated
gate:

- [ ] VoiceOver on macOS: complete onboarding, run a sample, open hints, submit,
      grade a review, and import a pack without a mouse.
- [ ] NVDA on Windows: same flow, including the Excalidraw canvas toolbar and
      dialogs.
- [ ] 200% OS zoom and the app's minimum 1024×700 window: no clipped controls or
      unreachable actions.
- [ ] High-contrast / forced-colors mode: focus indicators, badges, charts, and
      error callouts remain distinguishable on the target OS (forced-colors
      emulation is automated; verify the native mode manually).
- [ ] Keyboard-only canvas fallback: confirm the design notes and rubric are
      fully usable even if drawing is not.
- [ ] Color-blind simulation for status badges and progress charts.
- [ ] Screen-reader announcement of judge progress and final results.

Record the reviewer, date, OS, and any exceptions in this file before the Phase 9
accessibility checkbox is considered complete.
