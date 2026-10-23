# ADR-0005: Use CodeMirror 6 for the code editor

- Status: Accepted
- Date: 2026-10-23
- Deciders: Maintainer
- Supersedes: —

## Context

The coding workspace needs Python, TypeScript, and JavaScript editing with
syntax highlighting, themes, keyboard support, autosave, and a small offline
bundle. It is not a full IDE: no debugger, language server, terminal, or project
system. Excalidraw is already a large renderer dependency.

## Decision

Use CodeMirror 6 with language packages for Python and JavaScript/TypeScript,
a bundled monospace font or reliable system fallback, and a small set of
extensions for history, bracket matching, search, and keyboard shortcuts.

## Consequences

Positive:

- Much smaller and lighter than Monaco.
- Modular extensions and good keyboard/accessibility behavior.
- Works offline with no worker or language service.
- Easy to embed in a resizable pane with custom themes.

Negative:

- Fewer IDE features out of the box.
- Language support is highlighting and basic editing, not type checking.
- Custom snippets and keymaps must be maintained.

## Alternatives considered

- **Monaco:** Powerful, but heavy, worker-heavy, and overkill for a practice
  editor.
- **Ace:** Older architecture and weaker React integration.
- **Textarea:** Too limited for a code-focused product.

## Follow-up

- Verify renderer bundle size and keystroke latency in Phase 1.
- Evaluate screen-reader behavior with CodeMirror before MVP.
