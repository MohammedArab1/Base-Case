package judge

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
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
	request.Tests = request.Tests[:1]

	result, err := runner.Run(context.Background(), request)
	if err != nil {
		t.Fatalf("run: %v", err)
	}

	if result.Status != StatusTimeLimitExceeded {
		t.Fatalf("expected time_limit_exceeded, got %s", result.Status)
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
