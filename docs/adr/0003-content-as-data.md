# ADR-0003: Content packs are data, not executable plugins

- Status: Accepted
- Date: 2026-10-23
- Deciders: Maintainer
- Supersedes: —

## Context

Problems, tests, hints, solutions, and design scenarios must be versioned,
reviewable, importable, and safe to load from untrusted sources. A plugin
system that executes native code would turn every imported pack into a security
boundary failure.

## Decision

Represent content as JSON, JSON Lines, and Markdown files governed by a
versioned schema. No content pack may execute native code, spawn processes,
access the network, or provide arbitrary checker code in the MVP. Built-in
checkers (`exact`, `unordered`, `float`, `set-of-sets`) live in the judge.
Reference solutions are source text executed by the judge like any user code.

## Consequences

Positive:

- Packs can be validated, diffed, signed, and reviewed in CI.
- Importing a pack cannot run install scripts or native code.
- Content is portable across app versions and future platforms.
- Contributors do not need to build the app to add a problem.

Negative:

- Some problem shapes need new built-in checkers instead of a custom validator.
- The schema must evolve carefully and reject unknown major versions.
- Large test fixtures need a compression strategy.

## Alternatives considered

- **Executable plugins:** Maximum flexibility, unacceptable security and review
  cost.
- **JavaScript checkers in-process:** Tempting, but needs a pure-Go JS engine,
  time limits, and a minimal host API. Deferred until after MVP.

## Follow-up

- Version the schema and add migration notes for every breaking change.
- If custom validators are added, execute them in `goja` with a timeout and no
  filesystem/network/process APIs.
