# Judge protocol (draft v1)

- Status: Draft for Phase 1/3
- Transport: newline-delimited JSON (JSONL) over stdin/stdout
- Protocol version: `1`
- Implementation: `services/judge`

The judge sidecar owns execution. The host application (Electron main) owns
content, persistence, and presentation. Expected outputs never cross into the
language child process; the judge compares results.

## Framing rules

- UTF-8, one JSON object per line, `\n` terminated.
- stdout is reserved for protocol messages.
- stderr is for human diagnostics only.
- Blank lines are ignored.
- A request larger than 1 MiB is a protocol error and terminates the session.
- Request IDs are opaque strings chosen by the host; they must be echoed.
- Multiple requests may be in flight. The sidecar reads stdin continuously and
  writes all output through one serialized writer, so responses and events can
  interleave. Hosts must correlate by `id` and must not assume ordering across
  different IDs.
- A `run` request id must be unique while that run is active; reusing it returns
  `duplicate_request_id`.
- `shutdown` cancels active runs, waits briefly for them to finish, then replies
  and exits.

## Request

```json
{
  "id": "run-01",
  "method": "run",
  "params": {
    "problemId": "core/pair-sum",
    "language": "python",
    "code": "class Solution:\n    ...",
    "mode": "sample",
    "limits": { "timeMs": 2000, "memoryMb": 256 }
  }
}
```

Fields:

| Field    | Type   | Notes                              |
| -------- | ------ | ---------------------------------- |
| `id`     | string | Required, echoed in every response |
| `method` | string | Required                           |
| `params` | object | Method-specific                    |

## Response

Success:

```json
{
  "id": "run-01",
  "ok": true,
  "result": {
    "status": "accepted",
    "passed": 3,
    "total": 3
  }
}
```

Failure:

```json
{
  "id": "run-01",
  "ok": false,
  "error": {
    "code": "invalid_request",
    "message": "mode must be sample or submit"
  }
}
```

Streaming event:

```json
{
  "id": "run-01",
  "event": "test_result",
  "ok": true,
  "result": { "index": 0, "status": "passed", "runtimeMs": 12 }
}
```

`test_result` events are best-effort progress updates. They share the run's
`id` but never complete the request; the final response for a run has no `event`
field and includes the complete result model. Hosts must ignore unknown event
names and must not treat an event as a final response.

## Version 1 methods

| Method     | Params                                                           | Result                                                                  |
| ---------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `hello`    | none                                                             | `protocolVersion`, `name`, `version`, `os`, `arch`, `goVersion`         |
| `version`  | none                                                             | Same as `hello`                                                         |
| `ping`     | none                                                             | `{"pong": true}`                                                        |
| `doctor`   | none                                                             | Resolved runtime paths, versions, and source (`env`/`bundled`/`system`) |
| `shutdown` | none                                                             | `{"stopping": true}`; the sidecar exits                                 |
| `run`      | problem, language, code, mode, signature, limits, checker, tests | Result model                                                            |
| `cancel`   | `{"targetId": "run-01"}`                                         | `{"cancelled": true, "targetId": "run-01"}`                             |

`cancel` returns `cancelled: false` when no run with that id is active, so a
late cancel is not an error. The cancelled run still receives its own final
response with `status: "cancelled"`.

Unknown methods return `unknown_method`. Malformed JSON returns `invalid_json`
with an empty `id`. Unknown or malformed params return `invalid_params`.
Reusing an active run id returns `duplicate_request_id`.

## Result model

```json
{
  "status": "wrong_answer",
  "passed": 12,
  "total": 20,
  "compile": { "ok": true, "stdout": "", "stderr": "", "durationMs": 0 },
  "runtime": { "totalMs": 240, "maxMs": 80, "peakMemoryBytes": 25000000 },
  "firstFailure": {
    "index": 12,
    "isSample": false,
    "input": { "nums": [1, 2], "target": 4 },
    "expected": [0, 1],
    "actual": [0, 1, 2],
    "userStdout": "",
    "userStderr": "",
    "runtimeMs": 12,
    "memoryBytes": 15000000
  },
  "tests": [{ "index": 0, "status": "passed", "runtimeMs": 8, "memoryBytes": 14000000 }]
}
```

Statuses: `accepted`, `wrong_answer`, `compile_error`, `runtime_error`,
`time_limit_exceeded`, `memory_limit_exceeded`, `output_limit_exceeded`,
`internal_error`, `cancelled`.

Rules:

- `ListNode` values are JSON arrays. `TreeNode` values are level-order arrays
  with `null` placeholders; trailing nulls are trimmed. Both are encoded before
  they reach the host.
- In-place runs return `{ "returnValue": ..., "mutated": { ... } }`. The
  harness captures the listed parameters after the call; a `void` method
  returns `null`.
- Memory limits are enforced by sampling the runtime process tree every
  100 ms and by the kernel/job high-water mark after exit. Crossing the limit
  kills the process group and reports `memory_limit_exceeded`.
- `memoryBytes` and `peakMemoryBytes` are populated for completed tests; they
  are best-effort but always come from the OS rather than the user program.
- Always include the first failure, including on submit.
- Show full details for sample failures.
- After submit, show the smallest failing hidden test.
- Cap per-test payloads for very large suites.
- Include a human-readable message for internal errors.

## Lifecycle

1. Host spawns the sidecar and sends `hello`; it rejects a `protocolVersion`
   other than the one it implements.
2. Host sends `run` requests; the sidecar reads further requests while runs
   execute.
3. Sidecar prepares a temp workspace, transpiles/compiles once, then runs each
   test in a fresh child process.
4. Sidecar streams `test_result` events, then a final result.
5. Host may send `cancel` with the run's id; the sidecar cancels the run
   context, kills the process group, and reports `cancelled`.
6. Host sends `shutdown` on app exit; the sidecar cancels active runs, waits
   briefly, and exits.

## Security invariants

- Expected outputs are never written to the workspace or passed to the child.
- The child receives only the test input.
- The child runs in a per-run temp directory with a sanitized environment.
- Network access is denied where the platform permits it.
- Output is capped; overflow kills the process group.
- The judge never reads the user's home directory.
- The judge never logs API keys or user code by default.

## Example session

```jsonc
{"id":"1","method":"hello"}
{"id":"1","ok":true,"result":{"protocolVersion":1,"name":"base-case-judge","version":"0.1.0","os":"darwin","arch":"arm64","goVersion":"go1.27.2"}}
{"id":"2","method":"run","params":{"problemId":"core/pair-sum","language":"python","code":"...","mode":"sample","limits":{"timeMs":2000,"memoryMb":256}}}
{"id":"2","event":"test_result","ok":true,"result":{"index":0,"status":"passed","runtimeMs":12}}
{"id":"2","ok":true,"result":{"status":"accepted","passed":5,"total":5}}
{"id":"3","method":"shutdown"}
{"id":"3","ok":true,"result":{"stopping":true}}
```

## Compatibility

- Additive fields are allowed within version 1.
- Removing fields, changing meanings, or changing framing requires a new
  protocol version.
- The host performs the `hello` handshake once per sidecar process and rejects
  an unknown protocol version before sending any other request.
- Events are additive: a host that ignores them still receives a correct final
  response.
- The judge is a standalone CLI for testing and future integrations.
