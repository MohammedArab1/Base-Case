# ADR-0009: Sandbox user code with platform controls and documented limits

- Status: Accepted
- Date: 2026-10-23
- Deciders: Maintainer
- Supersedes: —

## Context

The app runs the user's own code (semi-trusted) and, later, code from imported
content packs (untrusted). The goal is to prevent accidental damage, runaway
resource use, and data exfiltration, not to resist a determined kernel exploit.
The supported platforms are macOS 13+ and Windows 10 21H2+ / 11. Linux is
explicitly out of scope for the initial releases.

## Decision

Use defense in depth:

- A fresh per-run temporary directory; delete it after the run.
- Fresh language process per test, in its own process group.
- Deny network access where the platform permits it.
- Deny writes outside the temp directory.
- Sanitize the environment: no API keys, proxies, or user site packages; fix
  `TZ`, `LANG`, and hash seeds.
- Cap stdout/stderr and kill on overflow.
- Enforce wall-clock and CPU limits, with memory sampling every 50–100 ms.
- Kill the entire process group on timeout, cancellation, or app shutdown.
- Disable core dumps.

macOS: `sandbox-exec` Seatbelt profile plus resource limits and a watchdog.
Windows: Job Objects for process-tree, memory, and CPU limits, plus a temp
directory. Filesystem isolation is best-effort in the MVP.

## Consequences

Positive:

- Accidental file writes and runaway processes are contained.
- The same controls work for sample runs, submissions, and conformance tests.
- Limits and cleanup are testable as part of the judge conformance suite.

Negative:

- `sandbox-exec` is deprecated and may be removed.
- Windows isolation is weaker than macOS; imported code is not safely isolated.
- Node/V8 needs JIT; hardened-runtime distribution may need JIT entitlements.
- Absolute time limits vary by machine.

## Residual risks (must be documented in the app and README)

- Hidden tests are extractable from the app bundle.
- Imported content may contain malicious inputs or checkers.
- The app is not suitable for hostile code execution or formal assessment.
- Sandbox strength varies by OS and may regress after OS updates.

## Follow-up

- Add security fixtures for network, home writes, output floods, fork bombs,
  timeouts, memory hogs, and cancellation.
- Re-test on every macOS and Windows release used by CI.
- Revisit Linux only if it is explicitly reintroduced after v1.0.
