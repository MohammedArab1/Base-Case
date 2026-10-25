//go:build darwin

package judge

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func sandboxRequest(method string, params []Param, returns, code, input, expected string) RunRequest {
	return RunRequest{
		ProblemID: "test/sandbox",
		Language:  "python",
		Code:      code,
		Mode:      "sample",
		Signature: Signature{
			Kind:      "function",
			ClassName: "Solution",
			Method:    method,
			Params:    params,
			Returns:   returns,
			Mutates:   []string{},
		},
		Limits:  Limits{TimeMs: 3000, MemoryMb: 256},
		Checker: Checker{Kind: "exact"},
		Tests: []Test{
			{
				Index:    0,
				IsSample: true,
				Input:    json.RawMessage(input),
				Expected: json.RawMessage(expected),
			},
		},
	}
}

func requireSandboxDenial(t *testing.T, result RunResult) {
	t.Helper()

	if result.Status != StatusRuntimeError {
		t.Fatalf("expected runtime_error, got %s failure=%+v", result.Status, result.FirstFailure)
	}
	if result.FirstFailure == nil || result.FirstFailure.Error == nil {
		t.Fatalf("expected a harness error, got %+v", result.FirstFailure)
	}

	message := strings.ToLower(result.FirstFailure.Error.Message)
	if !strings.Contains(message, "operation not permitted") &&
		!strings.Contains(message, "permission denied") {
		t.Fatalf("expected a sandbox denial, got %q", result.FirstFailure.Error.Message)
	}
}

func TestSandboxDeniesNetwork(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "python")

	request := sandboxRequest(
		"attempt",
		nil,
		"int",
		`import socket

class Solution:
    def attempt(self):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        sock.connect(("1.1.1.1", 80))
        return 1
`,
		`{}`,
		`1`,
	)

	result, err := runner.Run(context.Background(), request)
	if err != nil {
		t.Fatalf("run: %v", err)
	}

	requireSandboxDenial(t, result)
}

func TestSandboxDeniesHomeRead(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "python")

	home, err := os.UserHomeDir()
	if err != nil {
		t.Skipf("no home directory: %v", err)
	}

	file, err := os.CreateTemp(home, "base-case-sandbox-read-*")
	if err != nil {
		t.Skipf("cannot create a home fixture: %v", err)
	}
	path := file.Name()
	if _, err := file.WriteString("sandbox fixture"); err != nil {
		_ = file.Close()
		_ = os.Remove(path)
		t.Fatalf("write fixture: %v", err)
	}
	_ = file.Close()
	t.Cleanup(func() { _ = os.Remove(path) })

	request := sandboxRequest(
		"read",
		[]Param{{Name: "path", Type: "string"}},
		"string",
		`class Solution:
    def read(self, path):
        with open(path, "r") as handle:
            return handle.read()
`,
		fmt.Sprintf(`{"path":%q}`, path),
		`"sandbox fixture"`,
	)

	result, err := runner.Run(context.Background(), request)
	if err != nil {
		t.Fatalf("run: %v", err)
	}

	requireSandboxDenial(t, result)
}

func TestSandboxDeniesHomeWrite(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "python")

	home, err := os.UserHomeDir()
	if err != nil {
		t.Skipf("no home directory: %v", err)
	}

	path := filepath.Join(
		home,
		fmt.Sprintf("base-case-sandbox-write-%d.txt", time.Now().UnixNano()),
	)
	t.Cleanup(func() { _ = os.Remove(path) })

	request := sandboxRequest(
		"write",
		[]Param{{Name: "path", Type: "string"}},
		"string",
		`class Solution:
    def write(self, path):
        with open(path, "w") as handle:
            handle.write("escaped")
        return "wrote"
`,
		fmt.Sprintf(`{"path":%q}`, path),
		`"wrote"`,
	)

	result, err := runner.Run(context.Background(), request)
	if err != nil {
		t.Fatalf("run: %v", err)
	}

	requireSandboxDenial(t, result)

	if _, err := os.Stat(path); err == nil {
		t.Fatalf("the sandbox allowed a write to %s", path)
	}
}

func TestSandboxProcessLimit(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "python")

	request := sandboxRequest(
		"spawn",
		nil,
		"int",
		`import os
import time

class Solution:
    def spawn(self):
        for _ in range(70):
            pid = os.fork()
            if pid == 0:
                time.sleep(5)
                os._exit(0)
        time.sleep(5)
        return 1
`,
		`{}`,
		`1`,
	)
	request.Limits.MemoryMb = 4096
	request.Limits.TimeMs = 5000

	result, err := runner.Run(context.Background(), request)
	if err != nil {
		t.Fatalf("run: %v", err)
	}

	if result.Status != StatusRuntimeError {
		t.Fatalf("expected runtime_error, got %s failure=%+v", result.Status, result.FirstFailure)
	}
	if result.FirstFailure == nil ||
		!strings.Contains(strings.ToLower(result.FirstFailure.Message), "process limit") {
		t.Fatalf("expected a process-limit message, got %+v", result.FirstFailure)
	}
}

func TestSandboxDeniesProcessExec(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "python")

	request := sandboxRequest(
		"spawn",
		nil,
		"int",
		`import subprocess

class Solution:
    def spawn(self):
        subprocess.run(["/bin/echo", "escaped"], check=True)
        return 1
`,
		`{}`,
		`1`,
	)

	result, err := runner.Run(context.Background(), request)
	if err != nil {
		t.Fatalf("run: %v", err)
	}

	requireSandboxDenial(t, result)
}
