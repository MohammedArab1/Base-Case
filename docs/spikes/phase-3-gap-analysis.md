# Phase 3 gap analysis — judge engine

- Date: 2026-10-24
- Status: Planning input for Phase 3
- Scope: the Phase 3 checklist in `PLAN.md` versus the judge in `services/judge`
  and the Electron client in `apps/desktop/src/main/judge.ts`.
- Method: read the judge, protocol document, tests, ADRs 0009/0010, and the
  Phase 1/Windows reports; run the existing Go suites. No code changes were
  made for this analysis.

## Summary

The Phase 1 spike delivered a working judge foundation, not a blank slate:
JSONL protocol v1, request IDs, shutdown, doctor, Python and TypeScript
function harnesses, four checkers, time/output limits, process-group kill,
Windows kill-on-close Job Objects, environment sanitization, and an
end-to-end app loop. Phase 3 is therefore **partially complete**, but it is
not conformant yet.

The highest-risk gaps are:

1. **No memory enforcement.** `memory_limit_exceeded` is defined but never
   produced, and `memoryBytes` is always zero. Node gets
   `--max-old-space-size`; Python has no limit.
2. **No cancellation or streaming.** The host cannot cancel an in-flight run,
   and the sidecar processes requests sequentially, so a `cancel` line cannot
   be read until the run finishes.
3. **No sandbox boundary on macOS.** There is a temp directory, sanitized
   environment, and process-group kill, but no Seatbelt profile. Windows has
   kill-on-close Job Objects, not memory/CPU limits.
4. **No compile/transpile-once step.** TypeScript relies on Node 24 type
   stripping, and every test starts a fresh process that imports/transpiles
   the source again.
5. **The harness only covers function signatures.** `mutates` is plumbed but
   the harness emits `mutated: {}`; design, in-place, ListNode, and TreeNode
   execution are missing.
6. **The runtime strategy is unresolved.** ADR-0010 is still Proposed; the app
   depends on system Python/Node despite the zero-setup promise.
7. **Conformance is thin.** There is one real problem, no MLE/cancel/runtime
   error fixture, and no node/tree/in-place/design fixtures.

## Scorecard

| Phase 3 area                              | Status            | Evidence                                                                                           | Main gap                                                                    |
| ----------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| JSONL protocol, versioned                 | Done              | `internal/protocol/protocol.go`, `docs/architecture/judge-protocol.md`                             | Host does not reject an unknown major version                               |
| Request IDs and shutdown                  | Done              | `server.go`, `judge.ts`                                                                            | —                                                                           |
| Streaming `test_result` events            | Missing           | `Response.Event` is reserved but unused                                                            | Single final response per run                                               |
| In-flight cancellation                    | Missing           | `StatusCancelled` set only when the parent context is canceled; server uses `context.Background()` | Run blocks the read loop; no `cancel` method or host API                    |
| Runtime manager — discover/probe          | Done              | `runtimes.go`, `doctor` CLI/method                                                                 | —                                                                           |
| Runtime manager — bundle/checksums/repair | Missing           | ADR-0010; `BASE_CASE_PYTHON`/`BASE_CASE_NODE`                                                      | No pinned runtime packs                                                     |
| Function signature + harness              | Done              | `harness.go`, `runner_test.go`                                                                     | —                                                                           |
| In-place signatures                       | Partial           | `buildActual` reads `Mutated`, but harness never populates it                                      | No param mutation capture                                                   |
| ListNode / TreeNode codecs                | Missing           | No references in `services/judge`                                                                  | JSON values pass through unchanged                                          |
| Design signatures                         | Missing           | `validateRequest` rejects non-function kinds                                                       | Needs constructor + method dispatch                                         |
| Python harness                            | Partial           | `pythonHarness`                                                                                    | Function subset only                                                        |
| TypeScript/JS harness                     | Partial           | `typescriptHarness`; Node `--experimental-strip-types`                                             | No explicit transpile, no compile-once                                      |
| Fresh process per test                    | Done              | `runner.go` loop                                                                                   | —                                                                           |
| Compile/transpile once                    | Missing           | Workspace written once, but each test imports/transpiles                                           | Repeated work and no compile-only phase                                     |
| Sample vs. hidden mode                    | Done at app level | Host chooses sample/hidden test sets                                                               | Judge does not enforce mode semantics                                       |
| Time limits                               | Done              | `effectiveTimeLimit`, context deadline, process kill                                               | —                                                                           |
| Output limits                             | Done              | `capped.go`, tests                                                                                 | —                                                                           |
| Memory limits / MLE                       | Missing           | `effectiveMemoryMb` only feeds Node heap; `MemoryBytes: 0`                                         | No sampling, enforcement, or status                                         |
| Process-group kill and cleanup            | Done              | `process_unix.go`, `process_windows.go`, Phase 1 checklist                                         | POSIX orphan test is not automated                                          |
| Environment sanitization                  | Done              | `sanitizedEnv`                                                                                     | PATH still extends host PATH; acceptable for MVP                            |
| Checkers                                  | Done              | `checker.go`, `checker_test.go`                                                                    | —                                                                           |
| Result model                              | Partial           | `types.go`, runner                                                                                 | MLE/cancel never produced; tests stop at first failure by design            |
| macOS Seatbelt                            | Missing           | ADR-0009, Phase 1 report                                                                           | No profile or automated denial tests                                        |
| Windows Job Objects                       | Partial           | kill-on-close job object                                                                           | No memory/CPU job limits                                                    |
| Conformance fixtures                      | Partial           | 28 Go tests (26 cross-platform)                                                                    | Missing MLE, RE, cancel, design, node/tree, in-place, unicode, empty, large |
| CI matrix macOS + Windows                 | Done              | `.github/workflows/judge.yml`                                                                      | App-level judge E2E is not in CI                                            |
| Security tests + limitations doc          | Partial           | ADR-0009, threat model, Windows report                                                             | No automated network/home-write/fork-bomb tests                             |

## Exit-criteria assessment

| Criterion                                     | Status       | Notes                                                                                                           |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------- |
| Every status produced correctly               | Not met      | `memory_limit_exceeded` and user-triggered `cancelled` are unreachable                                          |
| No orphan processes after timeout/cancel      | Partial      | Timeout kill is tested; cancel does not exist; POSIX orphan check is manual                                     |
| Judge overhead < 100 ms/test                  | Probably met | Phase 1: 5 sample tests in 268 ms macOS and 151 ms Windows (~54/~30 ms per test); re-measure after compile-once |
| No home writes/network on macOS               | Not met      | No Seatbelt profile or denial tests                                                                             |
| Windows limits work; FS isolation best-effort | Partial      | Kill-on-close works; memory/CPU limits are absent; isolation is documented                                      |
| App runs one problem end-to-end               | Met          | `smoke:e2e` and the real judge loop pass on macOS and Windows                                                   |

## Decisions needed

### 1. Runtime bundling (ADR-0010)

Current installers are 190 MB (macOS arm64 DMG/ZIP) and 171 MiB (Windows
installer), against a 350 MB budget. The repo already supports pinned runtimes
through `BASE_CASE_PYTHON` and `BASE_CASE_NODE`.

Recommended path:

1. Measure pinned `python-build-standalone` and Node packs for macOS arm64 and
   Windows x64 in a throwaway branch.
2. If the packaged app stays under 350 MB and cold start stays under 3 s,
   accept ADR-0010 and bundle one runtime set per supported arch.
3. If not, switch to first-use language packs and make the offline limitation
   explicit.
4. Keep the env overrides for development and add `runtimes.json` checksums,
   license files, and a repair/verify flow.

Do not start the packaging work until the measurement is done. The decision
does not block protocol, memory, or harness work.

### 2. Cancellation and streaming semantics

Version 1 is sequential. Supporting `cancel` requires either a second reader
while `run` executes or a request loop that starts runs in goroutines and
writes responses through a single serialized writer. Recommendation:

- Keep the framing and version at 1.
- Read requests concurrently with a running job.
- Serialize all writes through one writer; responses are matched by `id`.
- Emit optional `test_result` events with the run `id` before the final result.
- Add `cancel` with `{ "targetId": "..." }`, cancel the run context, kill the
  process group, and return `cancelled`.
- Make the host `handleLine` ignore unknown events and add a
  `judge.cancel(requestId)` API with renderer wiring later.

### 3. Sandbox scope

Implement macOS Seatbelt with deny-network and deny-home (allow the temp
workspace, runtime paths, and system libraries). Keep Windows Job Objects for
process-tree kill and add job accounting for memory/CPU. Document that
`sandbox-exec` is deprecated and that Windows filesystem isolation is
best-effort. Add automated tests for home writes, network, fork/output floods,
and cancellation.

### 4. TypeScript transpilation

Replace Node type stripping with a pinned esbuild (or sucrase) step performed
once per run. Node should execute plain JavaScript in every test. This is
required regardless of the runtime-bundling decision.

### 5. Design-harness timing

The coding alpha only needs function and in-place signatures. The design
harness can land with Phase 5 rather than blocking the Phase 3 coding exit.
Recommendation: implement function + in-place + node/tree now; schedule design
with Phase 5 and adjust the Phase 3 checklist accordingly.

## Proposed work packages

| Order | Package                         | Outcome                                                                                                                    | Depends on                  |
| ----- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 1     | P3-A Protocol completion        | Concurrent read loop, serialized writer, `cancel`, optional `test_result` events, host version guard and cancel API; tests | —                           |
| 2     | P3-B Memory enforcement         | Process-tree sampling every 50–100 ms, hard kill, `memory_limit_exceeded`, peak memory in every result; tests              | —                           |
| 3     | P3-C Compile/transpile once     | esbuild TypeScript step, Python compile check, plain-JS execution, compile-only failures, tests                            | —                           |
| 4     | P3-D Harness coverage           | In-place mutation capture, ListNode/TreeNode codecs, Unicode/empty/large inputs; design deferred                           | Content schema and fixtures |
| 5     | P3-E Sandbox hardening          | macOS Seatbelt profile, Windows job memory/CPU limits, security fixtures                                                   | P3-B for accounting         |
| 6     | P3-F Runtime decision/packaging | Measure pinned runtimes; accept or supersede ADR-0010; checksums, licenses, repair, packaged smoke                         | Decision + P3-C             |
| 7     | P3-G Conformance matrix         | 20+ fixtures across statuses/types; app-level judge E2E in CI on macOS/Windows                                             | P3-A–E                      |

Estimated critical path: P3-A/B/C in parallel (~1 week), then P3-D/E (~1–2
weeks), then P3-F/G (~1–2 weeks), plus the runtime decision latency.

## Suggested immediate next step

Start **P3-A (protocol completion)** and **P3-B (memory enforcement)** together:

- They close two exit criteria.
- They do not depend on the runtime decision.
- They are testable with the existing pair-sum fixture.
- Cancellation is also required for a good run/submit UX in Phase 4.

P3-C can begin once the protocol tests settle. P3-F should wait for the
maintainer’s runtime-bundling decision.

## Evidence index

- `services/judge/internal/protocol/protocol.go` — version, methods, response shape.
- `services/judge/internal/server/server.go` — sequential request loop, run handling.
- `services/judge/internal/judge/runner.go` — execution loop, limits, env, result assembly.
- `services/judge/internal/judge/harness.go` — function harness templates.
- `services/judge/internal/judge/checker.go` — exact, unordered, float, set-of-sets.
- `services/judge/internal/judge/runtimes.go` — discovery, doctor, env overrides.
- `services/judge/internal/judge/process_unix.go`, `process_windows.go` — process control.
- `services/judge/internal/judge/runner_test.go`, `checker_test.go` — current conformance.
- `apps/desktop/src/main/judge.ts` — host request/response, no cancel, no version guard.
- `docs/architecture/judge-protocol.md` — draft v1 and future events/cancel.
- `docs/adr/0009-sandbox.md`, `docs/adr/0010-runtime-bundling.md`.
- `docs/spikes/phase-1-report.md` — known gaps and measurements.
- `docs/spikes/windows-verification.md` — Windows limitations and checks.
