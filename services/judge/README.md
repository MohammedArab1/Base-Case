# Judge sidecar

The judge is a standalone Go executable that will own compilation, execution,
resource limits, sandboxing, and result comparison. In Phase 0 it provides the
secure JSONL control channel; language adapters arrive in Phases 1 and 3.

## Build and test

```sh
go test ./...
go vet ./...
go build -o ../../build/judge ./cmd/judge
```

From the repository root:

```sh
pnpm judge:test
pnpm judge:vet
pnpm judge:build
```

## Run

```sh
./build/judge
```

Then write one JSON request per line:

```json
{"id":"1","method":"hello"}
{"id":"2","method":"ping"}
{"id":"3","method":"shutdown"}
```

Methods in protocol version 1:

| Method | Result |
|---|---|
| `hello` | Protocol version, judge name/version, OS, architecture, Go version |
| `version` | Same as `hello` |
| `ping` | `{"pong":true}` |
| `shutdown` | Stops the sidecar |
| `doctor` | Reports resolved Python and Node runtimes |
| `run` | Compiles/imports the solution and runs the supplied tests |

Errors are structured:

```json
{"id":"4","ok":false,"error":{"code":"unknown_method","message":"Unknown method \"run\"."}}
```

The sidecar never prints logs to stdout; stdout is reserved for protocol
messages. Diagnostics go to stderr. The protocol will grow request IDs,
streaming events, cancellation, and execution methods without breaking the
framing rules. See `docs/architecture/judge-protocol.md`.
