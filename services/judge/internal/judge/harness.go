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

func paramTypes(signature Signature) map[string]string {
	types := make(map[string]string, len(signature.Params))
	for _, param := range signature.Params {
		types[param.Name] = param.Type
	}
	return types
}

func nonNilStrings(values []string) []string {
	if values == nil {
		return []string{}
	}
	return values
}

// pythonHarness is intentionally small and generated from the signature. The
// harness owns protocol output; user stdout/stderr are teed to stderr and
// captured for the response. ListNode/TreeNode are injected into the user
// module so annotations resolve without requiring the author to define them.
const pythonHarnessTemplate = `import importlib.util
import json
import sys
import time
import traceback

CLASS_NAME = %s
METHOD_NAME = %s
PARAMS = %s
PARAM_TYPES = %s
MUTATES = %s
RETURN_TYPE = %s


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def build_list(values):
    if values is None:
        return None
    head = None
    tail = None
    for value in values:
        node = ListNode(value)
        if head is None:
            head = node
        else:
            tail.next = node
        tail = node
    return head


def dump_list(node):
    values = []
    seen = set()
    while node is not None:
        marker = id(node)
        if marker in seen:
            break
        seen.add(marker)
        values.append(node.val)
        node = node.next
    return values


def build_tree(values):
    if not values:
        return None
    root = TreeNode(values[0])
    queue = [root]
    queue_index = 0
    index = 1
    while queue_index < len(queue) and index < len(values):
        node = queue[queue_index]
        queue_index += 1
        if index < len(values):
            value = values[index]
            if value is not None:
                node.left = TreeNode(value)
                queue.append(node.left)
            index += 1
        if index < len(values):
            value = values[index]
            if value is not None:
                node.right = TreeNode(value)
                queue.append(node.right)
            index += 1
    return root


def dump_tree(root):
    if root is None:
        return []
    values = []
    queue = [root]
    index = 0
    seen = set()
    while index < len(queue):
        node = queue[index]
        index += 1
        if node is None:
            values.append(None)
            continue
        marker = id(node)
        if marker in seen:
            break
        seen.add(marker)
        values.append(node.val)
        queue.append(node.left)
        queue.append(node.right)
    while values and values[-1] is None:
        values.pop()
    return values


def decode(type_name, value):
    if type_name == "ListNode":
        return build_list(value)
    if type_name == "TreeNode":
        return build_tree(value)
    return value


def encode(type_name, value):
    if type_name == "ListNode":
        return dump_list(value)
    if type_name == "TreeNode":
        return dump_tree(value)
    return value


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
        module.ListNode = ListNode
        module.TreeNode = TreeNode
        spec.loader.exec_module(module)
        solution_class = getattr(module, CLASS_NAME)
        instance = solution_class()
        args = [
            decode(PARAM_TYPES.get(name), payload["input"][name])
            for name in PARAMS
        ]
        result = getattr(instance, METHOD_NAME)(*args)
        mutated = {}
        for name in MUTATES:
            if name in PARAMS:
                mutated[name] = encode(PARAM_TYPES.get(name), args[PARAMS.index(name)])
        elapsed = (time.perf_counter() - started) * 1000.0
        response = {
            "ok": True,
            "result": encode(RETURN_TYPE, result),
            "mutated": mutated,
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
		jsonLiteral(paramTypes(signature)),
		jsonLiteral(nonNilStrings(signature.Mutates)),
		jsonLiteral(signature.Returns),
	)
}

// typescriptHarness runs plain ESM. TypeScript is transpiled once per run by
// compileWorkspace, so Node never needs type stripping here. ListNode and
// TreeNode are installed on globalThis before the user module is imported so
// solutions can construct them without importing anything.
const typescriptHarnessTemplate = `import { readFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'

const CLASS_NAME = %s
const METHOD_NAME = %s
const PARAMS = %s
const PARAM_TYPES = %s
const MUTATES = %s
const RETURN_TYPE = %s

class ListNode {
  constructor(val = 0, next = null) {
    this.val = val
    this.next = next
  }
}

class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val
    this.left = left
    this.right = right
  }
}

globalThis.ListNode = ListNode
globalThis.TreeNode = TreeNode

function buildList(values) {
  if (!values) {
    return null
  }

  let head = null
  let tail = null
  for (const value of values) {
    const node = new ListNode(value)
    if (head === null) {
      head = node
    } else {
      tail.next = node
    }
    tail = node
  }
  return head
}

function dumpList(node) {
  const values = []
  const seen = new Set()
  while (node) {
    if (seen.has(node)) {
      break
    }
    seen.add(node)
    values.push(node.val)
    node = node.next
  }
  return values
}

function buildTree(values) {
  if (!values || values.length === 0) {
    return null
  }

  const root = new TreeNode(values[0])
  const queue = [root]
  let queueIndex = 0
  let index = 1

  while (queueIndex < queue.length && index < values.length) {
    const node = queue[queueIndex]
    queueIndex += 1

    if (index < values.length) {
      if (values[index] !== null) {
        node.left = new TreeNode(values[index])
        queue.push(node.left)
      }
      index += 1
    }

    if (index < values.length) {
      if (values[index] !== null) {
        node.right = new TreeNode(values[index])
        queue.push(node.right)
      }
      index += 1
    }
  }

  return root
}

function dumpTree(root) {
  if (!root) {
    return []
  }

  const values = []
  const queue = [root]
  const seen = new Set()
  let index = 0

  while (index < queue.length) {
    const node = queue[index]
    index += 1

    if (node === null) {
      values.push(null)
      continue
    }

    if (seen.has(node)) {
      break
    }
    seen.add(node)
    values.push(node.val)
    queue.push(node.left)
    queue.push(node.right)
  }

  while (values.length > 0 && values[values.length - 1] === null) {
    values.pop()
  }

  return values
}

function decode(typeName, value) {
  if (typeName === 'ListNode') {
    return buildList(value)
  }
  if (typeName === 'TreeNode') {
    return buildTree(value)
  }
  return value
}

function encode(typeName, value) {
  if (typeName === 'ListNode') {
    return dumpList(value)
  }
  if (typeName === 'TreeNode') {
    return dumpTree(value)
  }
  return value === undefined ? null : value
}

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
  const args = PARAMS.map((name) => decode(PARAM_TYPES[name], payload.input[name]))
  const result = instance[METHOD_NAME](...args)
  const mutated = {}
  for (const name of MUTATES) {
    const index = PARAMS.indexOf(name)
    if (index >= 0) {
      mutated[name] = encode(PARAM_TYPES[name], args[index])
    }
  }
  const durationMs = performance.now() - started
  protocolWrite(JSON.stringify({
    ok: true,
    result: encode(RETURN_TYPE, result),
    mutated,
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
  const location = rawStack.match(/solution\.(?:ts|mjs|js):(\d+):(\d+)/)
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
		jsonLiteral(paramTypes(signature)),
		jsonLiteral(nonNilStrings(signature.Mutates)),
		jsonLiteral(signature.Returns),
		jsonLiteral(modulePath),
	)
}
