package judge

import (
	"encoding/json"
	"fmt"
)

func jsonLiteral(value any) string {
	data, err := json.Marshal(value)
	if err != nil {
		return "null"
	}
	return string(data)
}

func paramNames(signature Signature) []string {
	names := make([]string, 0, len(signature.Params))
	for _, param := range signature.Params {
		names = append(names, param.Name)
	}
	return names
}

// pythonHarness is intentionally small and generated from the signature. The
// harness owns protocol output; user stdout/stderr are teed to stderr and
// captured for the response.
const pythonHarnessTemplate = `import importlib.util
import json
import sys
import time
import traceback

CLASS_NAME = %s
METHOD_NAME = %s
PARAMS = %s


class Tee:
    def __init__(self, stream, sink):
        self.stream = stream
        self.sink = sink

    def write(self, data):
        text = str(data)
        self.sink.append(text)
        return self.stream.write(text)

    def flush(self):
        self.stream.flush()


def main():
    protocol_out = sys.stdout
    original_stderr = sys.stderr
    raw = sys.stdin.read()
    payload = json.loads(raw) if raw.strip() else {}
    user_stdout = []
    user_stderr = []
    sys.stdout = Tee(original_stderr, user_stdout)
    sys.stderr = Tee(original_stderr, user_stderr)
    started = time.perf_counter()

    try:
        spec = importlib.util.spec_from_file_location("user_solution", "solution.py")
        if spec is None or spec.loader is None:
            raise ImportError("Could not load solution.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        solution_class = getattr(module, CLASS_NAME)
        instance = solution_class()
        args = [payload["input"][name] for name in PARAMS]
        result = getattr(instance, METHOD_NAME)(*args)
        elapsed = (time.perf_counter() - started) * 1000.0
        response = {
            "ok": True,
            "result": result,
            "mutated": {},
            "userStdout": "".join(user_stdout),
            "userStderr": "".join(user_stderr),
            "durationMs": round(elapsed, 3),
        }
    except BaseException as exc:
        elapsed = (time.perf_counter() - started) * 1000.0
        frames = [
            frame
            for frame in traceback.extract_tb(exc.__traceback__)
            if frame.filename != __file__
        ]
        user_line = getattr(exc, "lineno", 0) or (frames[-1].lineno if frames else 0)
        stack = "".join(traceback.format_list(frames))
        stack += "".join(traceback.format_exception_only(type(exc), exc))
        response = {
            "ok": False,
            "error": {
                "type": type(exc).__name__,
                "message": str(exc),
                "stack": stack,
                "userLine": int(user_line or 0),
            },
            "userStdout": "".join(user_stdout),
            "userStderr": "".join(user_stderr),
            "durationMs": round(elapsed, 3),
        }

    protocol_out.write(json.dumps(response, separators=(",", ":")) + "\n")
    protocol_out.flush()


main()
`

func pythonHarness(signature Signature) string {
	return fmt.Sprintf(
		pythonHarnessTemplate,
		jsonLiteral(signature.ClassName),
		jsonLiteral(signature.Method),
		jsonLiteral(paramNames(signature)),
	)
}

// typescriptHarness uses Node's type-stripping support in the Phase 1 spike.
// Phase 3 will transpile explicitly with esbuild or sucrase instead of relying
// on the host Node version.
const typescriptHarnessTemplate = `import { readFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'

const CLASS_NAME = %s
const METHOD_NAME = %s
const PARAMS = %s

const protocolWrite = process.stdout.write.bind(process.stdout)
const stderrWrite = process.stderr.write.bind(process.stderr)
const userStdout = []
const userStderr = []

process.stdout.write = (chunk, encoding, callback) => {
  userStdout.push(typeof chunk === 'string' ? chunk : chunk.toString())
  return stderrWrite(chunk, encoding, callback)
}

process.stderr.write = (chunk, encoding, callback) => {
  userStderr.push(typeof chunk === 'string' ? chunk : chunk.toString())
  return stderrWrite(chunk, encoding, callback)
}

const raw = readFileSync(0, 'utf8')
const payload = raw.trim() ? JSON.parse(raw) : {}
const started = performance.now()

try {
  const module = await import(%s)
  const Solution = module[CLASS_NAME]
  if (typeof Solution !== 'function') {
    throw new TypeError('The solution class was not exported')
  }
  const instance = new Solution()
  const args = PARAMS.map((name) => payload.input[name])
  const result = instance[METHOD_NAME](...args)
  const durationMs = performance.now() - started
  protocolWrite(JSON.stringify({
    ok: true,
    result: result === undefined ? null : result,
    mutated: {},
    userStdout: userStdout.join(''),
    userStderr: userStderr.join(''),
    durationMs: Number(durationMs.toFixed(3)),
  }) + '\n')
} catch (error) {
  const durationMs = performance.now() - started
  const type = error && error.name ? String(error.name) : 'Error'
  const message = error && error.message ? String(error.message) : String(error)
  const rawStack = error && error.stack ? String(error.stack) : message
  const stack = rawStack
    .split('\n')
    .filter((line) => !line.includes('harness.mjs'))
    .join('\n')
  const location = rawStack.match(/solution\.(?:ts|js):(\d+):(\d+)/)
  protocolWrite(JSON.stringify({
    ok: false,
    error: {
      type,
      message,
      stack,
      userLine: location ? Number(location[1]) : 0,
    },
    userStdout: userStdout.join(''),
    userStderr: userStderr.join(''),
    durationMs: Number(durationMs.toFixed(3)),
  }) + '\n')
}
`

func typescriptHarness(signature Signature, modulePath string) string {
	return fmt.Sprintf(
		typescriptHarnessTemplate,
		jsonLiteral(signature.ClassName),
		jsonLiteral(signature.Method),
		jsonLiteral(paramNames(signature)),
		jsonLiteral(modulePath),
	)
}
