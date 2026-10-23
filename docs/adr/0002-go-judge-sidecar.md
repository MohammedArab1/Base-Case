# ADR-0002: Use a Go sidecar for the judge

- Status: Accepted
- Date: 2026-10-23
- Deciders: Maintainer
- Supersedes: —

## Context

The judge must compile/transpile and run untrusted-ish user code, enforce wall
clock, CPU, memory, and output limits, kill process groups, and produce
structured results on macOS and Windows. It must also be testable as a
standalone CLI. The Electron main process should never block on execution.

## Decision

Ship a separate Go executable, `base-case-judge`, with a newline-delimited JSON
protocol on stdin/stdout. The Electron main process spawns it, sends requests,
and consumes responses/events. The judge owns language adapters, runtime
discovery, sandbox profiles, limits, checkers, and result normalization.

## Consequences

Positive:

- Single static binary per platform/arch; no Node native addons for execution.
- Strong process control (`os/exec`, process groups, Windows Job Objects).
- The same binary is a CLI for conformance tests and future integrations.
- The judge can crash or be restarted without taking down the app.

Negative:

- Two languages in the build and release pipeline.
- The JSONL protocol needs versioning, request IDs, cancellation, and
  backpressure handling.
- Cross-platform process-group and sandbox behavior must be tested separately.
- Harness code is generated in Python/TypeScript but orchestrated in Go.

## Alternatives considered

- **Node judge:** One language, but weaker process isolation and more exposure
  of the app runtime to user code.
- **Rust judge:** Strong sandboxing and performance, but slower iteration for
  this maintainer and a smaller contribution pool.
- **In-process JS VM:** Not safe enough for Python, native calls, or process
  limits.

## Follow-up

- Freeze protocol version 1 in Phase 3.
- Keep the protocol transport-independent enough to replace the sidecar with a
  Node judge if the Phase 1 spike fails.
