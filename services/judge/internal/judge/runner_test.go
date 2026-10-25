package judge

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"
)

const pythonPairSum = `class Solution:
    def pairSum(self, nums, target):
        seen = {}
        for index, value in enumerate(nums):
            complement = target - value
            if complement in seen:
                return [seen[complement], index]
            seen[value] = index
        return []
`

const typescriptPairSum = `class Solution {
  pairSum(nums: number[], target: number): number[] {
    const seen = new Map<number, number>()
    for (let index = 0; index < nums.length; index += 1) {
      const value = nums[index]
      const complement = target - value
      const first = seen.get(complement)
      if (first !== undefined) {
        return [first, index]
      }
      seen.set(value, index)
    }
    return []
  }
}

export { Solution }
`

func pairSumRequest(language, code string) RunRequest {
	return RunRequest{
		ProblemID: "core/pair-sum",
		Language:  language,
		Code:      code,
		Mode:      "sample",
		Signature: Signature{
			Kind:      "function",
			ClassName: "Solution",
			Method:    "pairSum",
			Params: []Param{
				{Name: "nums", Type: "int[]"},
				{Name: "target", Type: "int"},
			},
			Returns: "int[]",
			Mutates: []string{},
		},
		Limits: Limits{
			TimeMs:   2000,
			MemoryMb: 256,
			// Mirrors content/packs/core/problems/pair-sum/problem.json so the
			// fixture exercises the same limits as the app.
			LanguageMultipliers: map[string]float64{
				"python":     3,
				"javascript": 3,
				"typescript": 3,
			},
		},
		Checker: Checker{Kind: "unordered"},
		Tests: []Test{
			{
				Index:    0,
				IsSample: true,
				Input:    json.RawMessage(`{"nums":[2,7,11,15],"target":9}`),
				Expected: json.RawMessage(`[0,1]`),
			},
			{
				Index:    1,
				IsSample: true,
				Input:    json.RawMessage(`{"nums":[3,3],"target":6}`),
				Expected: json.RawMessage(`[0,1]`),
			},
		},
	}
}

func requireRuntime(t *testing.T, runner *Runner, language string) {
	t.Helper()

	switch language {
	case "python":
		if runner.PythonPath == "" {
			t.Skip("python3/python is not available")
		}
	case "typescript", "javascript":
		if runner.NodePath == "" {
			t.Skip("node is not available")
		}
	}
}

func runAcceptedProblem(t *testing.T, language, code string) {
	t.Helper()

	runner := NewRunner()
	requireRuntime(t, runner, language)

	result, err := runner.Run(context.Background(), pairSumRequest(language, code))
	if err != nil {
		t.Fatalf("run: %v", err)
	}

	if result.Status != StatusAccepted {
		t.Fatalf("expected accepted, got status=%s failure=%+v message=%s", result.Status, result.FirstFailure, result.Message)
	}
	if result.Passed != 2 || result.Total != 2 {
		t.Fatalf("expected 2/2, got %d/%d", result.Passed, result.Total)
	}
	if result.Compile.OK != true {
		t.Fatalf("expected compile ok, got %+v", result.Compile)
	}
	if result.Runtime.PeakMemoryBytes <= 0 {
		t.Fatalf("expected peak memory to be reported, got %+v", result.Runtime)
	}
	for _, testResult := range result.Tests {
		if testResult.MemoryBytes <= 0 {
			t.Fatalf("expected per-test memory, got %+v", testResult)
		}
	}
}

func TestPythonPairSumAccepted(t *testing.T) {
	runAcceptedProblem(t, "python", pythonPairSum)
}

func TestTypeScriptPairSumAccepted(t *testing.T) {
	runAcceptedProblem(t, "typescript", typescriptPairSum)
}

func TestWrongAnswer(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "python")

	request := pairSumRequest("python", `class Solution:
    def pairSum(self, nums, target):
        return []
`)
	result, err := runner.Run(context.Background(), request)
	if err != nil {
		t.Fatalf("run: %v", err)
	}

	if result.Status != StatusWrongAnswer {
		t.Fatalf("expected wrong_answer, got %s", result.Status)
	}
	if result.FirstFailure == nil || result.FirstFailure.Actual == nil {
		t.Fatalf("expected first failure with actual value, got %+v", result.FirstFailure)
	}
	if len(result.Tests) != 1 {
		t.Fatalf("expected the run to stop after the first failure, got %d test results", len(result.Tests))
	}
}

func TestCompileError(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "python")

	request := pairSumRequest("python", `class Solution:
    def pairSum(self, nums, target)
        return []
`)
	result, err := runner.Run(context.Background(), request)
	if err != nil {
		t.Fatalf("run: %v", err)
	}

	if result.Status != StatusCompileError {
		t.Fatalf("expected compile_error, got %s failure=%+v", result.Status, result.FirstFailure)
	}
	if result.Compile.OK {
		t.Fatal("expected compile.ok=false")
	}
}

func TestTimeLimitExceeded(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "python")

	request := pairSumRequest("python", `class Solution:
    def pairSum(self, nums, target):
        while True:
            pass
`)
	request.Limits.TimeMs = 100

	result, err := runner.Run(context.Background(), request)
	if err != nil {
		t.Fatalf("run: %v", err)
	}

	if result.Status != StatusTimeLimitExceeded {
		t.Fatalf("expected time_limit_exceeded, got %s", result.Status)
	}
	if len(result.Tests) != 1 {
		t.Fatalf("expected the run to stop after the first timeout, got %d test results", len(result.Tests))
	}
}

func TestMemoryLimitExceeded(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "python")

	request := pairSumRequest("python", `class Solution:
    def pairSum(self, nums, target):
        chunks = []
        while True:
            chunks.append(bytearray(8 * 1024 * 1024))
`)
	request.Limits.MemoryMb = 32
	request.Limits.TimeMs = 5000
	request.Tests = request.Tests[:1]

	result, err := runner.Run(context.Background(), request)
	if err != nil {
		t.Fatalf("run: %v", err)
	}

	if result.Status != StatusMemoryLimitExceeded {
		t.Fatalf("expected memory_limit_exceeded, got %s failure=%+v", result.Status, result.FirstFailure)
	}
	if result.Runtime.PeakMemoryBytes <= 0 {
		t.Fatalf("expected peak memory, got %+v", result.Runtime)
	}
}

func TestMemoryLimitExceededAfterExit(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "python")

	request := pairSumRequest("python", `class Solution:
    def pairSum(self, nums, target):
        blob = bytearray(200 * 1024 * 1024)
        return [0, 1] if blob else []
`)
	request.Limits.MemoryMb = 32
	request.Tests = request.Tests[:1]

	result, err := runner.Run(context.Background(), request)
	if err != nil {
		t.Fatalf("run: %v", err)
	}

	if result.Status != StatusMemoryLimitExceeded {
		t.Fatalf("expected memory_limit_exceeded, got %s peak=%d", result.Status, result.Runtime.PeakMemoryBytes)
	}
}

func TestOutputLimitExceeded(t *testing.T) {
	runner := NewRunner()
	runner.OutputLimitBytes = 4096
	requireRuntime(t, runner, "python")

	request := pairSumRequest("python", `class Solution:
    def pairSum(self, nums, target):
        while True:
            print("x" * 1024)
`)
	request.Limits.TimeMs = 5000
	request.Tests = request.Tests[:1]

	result, err := runner.Run(context.Background(), request)
	if err != nil {
		t.Fatalf("run: %v", err)
	}

	if result.Status != StatusOutputLimitExceeded {
		t.Fatalf("expected output_limit_exceeded, got %s", result.Status)
	}
}

func TestRunEmitsTestResults(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "python")

	var events []TestResult
	result, err := runner.RunWithEvents(
		context.Background(),
		pairSumRequest("python", pythonPairSum),
		func(testResult TestResult) {
			events = append(events, testResult)
		},
	)
	if err != nil {
		t.Fatalf("run: %v", err)
	}

	if result.Status != StatusAccepted {
		t.Fatalf("expected accepted, got %s", result.Status)
	}
	if len(events) != 2 {
		t.Fatalf("expected 2 events, got %d", len(events))
	}
	for index, event := range events {
		if event.Index != index || event.Status != StatusAccepted {
			t.Fatalf("unexpected event %d: %+v", index, event)
		}
	}
}

func TestRunCancellation(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "python")

	request := pairSumRequest("python", `class Solution:
    def pairSum(self, nums, target):
        while True:
            pass
`)
	request.Limits.TimeMs = 10000
	request.Tests = request.Tests[:1]

	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan struct{})
	var result RunResult
	var runErr error

	go func() {
		result, runErr = runner.Run(ctx, request)
		close(done)
	}()

	time.Sleep(500 * time.Millisecond)
	cancel()

	select {
	case <-done:
	case <-time.After(10 * time.Second):
		t.Fatal("run did not stop after cancellation")
	}

	if runErr != nil {
		t.Fatalf("run: %v", runErr)
	}
	if result.Status != StatusCancelled {
		t.Fatalf("expected cancelled, got %s failure=%+v", result.Status, result.FirstFailure)
	}
}

func TestRunCancelledBeforeStart(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "python")

	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	result, err := runner.Run(ctx, pairSumRequest("python", pythonPairSum))
	if err != nil {
		t.Fatalf("run: %v", err)
	}
	if result.Status != StatusCancelled {
		t.Fatalf("expected cancelled, got %s", result.Status)
	}
	if len(result.Tests) != 0 {
		t.Fatalf("expected no tests to run, got %d", len(result.Tests))
	}
}

func TestMissingRuntime(t *testing.T) {
	runner := &Runner{}
	_, err := runner.Run(context.Background(), pairSumRequest("python", pythonPairSum))
	if !errors.Is(err, ErrRuntimeMissing) {
		t.Fatalf("expected ErrRuntimeMissing, got %v", err)
	}
}

func TestDesignSignatureRejectedInSpike(t *testing.T) {
	runner := NewRunner()
	request := pairSumRequest("python", pythonPairSum)
	request.Signature.Kind = "design"

	_, err := runner.Run(context.Background(), request)
	if !errors.Is(err, ErrInvalidRequest) {
		t.Fatalf("expected ErrInvalidRequest, got %v", err)
	}
}

func TestParseHarnessOutputUsesLastValidLine(t *testing.T) {
	response, ok := parseHarnessOutput("user output\n{\"ok\":true,\"result\":[0,1]}\n")
	if !ok {
		t.Fatal("expected harness response")
	}
	if string(response.Result) != "[0,1]" {
		t.Fatalf("unexpected result: %s", response.Result)
	}
}
