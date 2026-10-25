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
	if len(result.Tests) != 0 {
		t.Fatalf("expected no tests to run, got %d", len(result.Tests))
	}
	if result.FirstFailure == nil || result.FirstFailure.UserStderr == "" {
		t.Fatalf("expected the compiler output on the first failure, got %+v", result.FirstFailure)
	}
}

func TestTypeScriptCompileError(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "typescript")

	request := pairSumRequest("typescript", `class Solution {
  pairSum(nums: number[], target: number): number[] {
    const value: = 1
    return [0, 1]
  }
}

export { Solution }
`)
	result, err := runner.Run(context.Background(), request)
	if err != nil {
		t.Fatalf("run: %v", err)
	}

	if result.Status != StatusCompileError {
		t.Fatalf("expected compile_error, got %s failure=%+v", result.Status, result.FirstFailure)
	}
	if result.Compile.OK || result.Compile.Stderr == "" {
		t.Fatalf("expected esbuild output, got %+v", result.Compile)
	}
	if len(result.Tests) != 0 {
		t.Fatalf("expected no tests to run, got %d", len(result.Tests))
	}
}

func TestTypeScriptTranspilesEnums(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "typescript")

	request := pairSumRequest("typescript", `enum Direction {
  Up = 1,
}

class Solution {
  pairSum(nums: number[], target: number): number[] {
    return Direction.Up === 1 ? [0, 1] : []
  }
}

export { Solution }
`)
	result, err := runner.Run(context.Background(), request)
	if err != nil {
		t.Fatalf("run: %v", err)
	}

	if result.Status != StatusAccepted {
		t.Fatalf("expected accepted, got %s failure=%+v", result.Status, result.FirstFailure)
	}
}

func TestJavaScriptCompileError(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "javascript")

	request := pairSumRequest("javascript", `class Solution {
  pairSum(nums, target) {
    return [0, 1
  }
}

export { Solution }
`)
	result, err := runner.Run(context.Background(), request)
	if err != nil {
		t.Fatalf("run: %v", err)
	}

	if result.Status != StatusCompileError {
		t.Fatalf("expected compile_error, got %s failure=%+v", result.Status, result.FirstFailure)
	}
	if result.Compile.OK || result.Compile.Stderr == "" {
		t.Fatalf("expected node --check output, got %+v", result.Compile)
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

func linkedListRequest(language, code string) RunRequest {
	return RunRequest{
		ProblemID: "test/reverse-list",
		Language:  language,
		Code:      code,
		Mode:      "sample",
		Signature: Signature{
			Kind:      "function",
			ClassName: "Solution",
			Method:    "reverseList",
			Params:    []Param{{Name: "head", Type: "ListNode"}},
			Returns:   "ListNode",
			Mutates:   []string{},
		},
		Limits:  Limits{TimeMs: 2000, MemoryMb: 256},
		Checker: Checker{Kind: "exact"},
		Tests: []Test{
			{
				Index:    0,
				IsSample: true,
				Input:    json.RawMessage(`{"head":[1,2,3]}`),
				Expected: json.RawMessage(`[3,2,1]`),
			},
		},
	}
}

func treeRequest(language, code string) RunRequest {
	return RunRequest{
		ProblemID: "test/invert-tree",
		Language:  language,
		Code:      code,
		Mode:      "sample",
		Signature: Signature{
			Kind:      "function",
			ClassName: "Solution",
			Method:    "invertTree",
			Params:    []Param{{Name: "root", Type: "TreeNode"}},
			Returns:   "TreeNode",
			Mutates:   []string{},
		},
		Limits:  Limits{TimeMs: 2000, MemoryMb: 256},
		Checker: Checker{Kind: "exact"},
		Tests: []Test{
			{
				Index:    0,
				IsSample: true,
				Input:    json.RawMessage(`{"root":[4,2,7,1,3,6,9]}`),
				Expected: json.RawMessage(`[4,7,2,9,6,3,1]`),
			},
			{
				Index:    1,
				IsSample: true,
				Input:    json.RawMessage(`{"root":[]}`),
				Expected: json.RawMessage(`[]`),
			},
		},
	}
}

func inPlaceArrayRequest(language, code string) RunRequest {
	return RunRequest{
		ProblemID: "test/sort-colors",
		Language:  language,
		Code:      code,
		Mode:      "sample",
		Signature: Signature{
			Kind:      "function",
			ClassName: "Solution",
			Method:    "sortColors",
			Params:    []Param{{Name: "nums", Type: "int[]"}},
			Returns:   "void",
			Mutates:   []string{"nums"},
		},
		Limits:  Limits{TimeMs: 2000, MemoryMb: 256},
		Checker: Checker{Kind: "exact"},
		Tests: []Test{
			{
				Index:    0,
				IsSample: true,
				Input:    json.RawMessage(`{"nums":[3,1,2]}`),
				Expected: json.RawMessage(`{"returnValue":null,"mutated":{"nums":[1,2,3]}}`),
			},
		},
	}
}

func inPlaceNodeRequest(language, code string) RunRequest {
	return RunRequest{
		ProblemID: "test/double-list",
		Language:  language,
		Code:      code,
		Mode:      "sample",
		Signature: Signature{
			Kind:      "function",
			ClassName: "Solution",
			Method:    "double",
			Params:    []Param{{Name: "head", Type: "ListNode"}},
			Returns:   "void",
			Mutates:   []string{"head"},
		},
		Limits:  Limits{TimeMs: 2000, MemoryMb: 256},
		Checker: Checker{Kind: "exact"},
		Tests: []Test{
			{
				Index:    0,
				IsSample: true,
				Input:    json.RawMessage(`{"head":[1,2,3]}`),
				Expected: json.RawMessage(`{"returnValue":null,"mutated":{"head":[2,4,6]}}`),
			},
		},
	}
}

func TestPythonLinkedListCodec(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "python")

	result, err := runner.Run(context.Background(), linkedListRequest("python", `class Solution:
    def reverseList(self, head: ListNode) -> ListNode:
        previous = None
        while head:
            head.next, previous, head = previous, head, head.next
        return previous
`))
	if err != nil {
		t.Fatalf("run: %v", err)
	}
	if result.Status != StatusAccepted {
		t.Fatalf("expected accepted, got %s failure=%+v", result.Status, result.FirstFailure)
	}
}

func TestTypeScriptLinkedListCodec(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "typescript")

	result, err := runner.Run(context.Background(), linkedListRequest("typescript", `class Solution {
  reverseList(head: ListNode | null): ListNode | null {
    let previous: ListNode | null = null
    while (head) {
      const next = head.next
      head.next = previous
      previous = head
      head = next
    }
    return previous
  }
}

export { Solution }
`))
	if err != nil {
		t.Fatalf("run: %v", err)
	}
	if result.Status != StatusAccepted {
		t.Fatalf("expected accepted, got %s failure=%+v", result.Status, result.FirstFailure)
	}
}

func TestPythonTreeCodec(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "python")

	result, err := runner.Run(context.Background(), treeRequest("python", `class Solution:
    def invertTree(self, root: TreeNode) -> TreeNode:
        if root:
            root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)
        return root
`))
	if err != nil {
		t.Fatalf("run: %v", err)
	}
	if result.Status != StatusAccepted {
		t.Fatalf("expected accepted, got %s failure=%+v", result.Status, result.FirstFailure)
	}
}

func TestTypeScriptTreeCodec(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "typescript")

	result, err := runner.Run(context.Background(), treeRequest("typescript", `class Solution {
  invertTree(root: TreeNode | null): TreeNode | null {
    if (root) {
      const left = this.invertTree(root.left)
      root.left = this.invertTree(root.right)
      root.right = left
    }
    return root
  }
}

export { Solution }
`))
	if err != nil {
		t.Fatalf("run: %v", err)
	}
	if result.Status != StatusAccepted {
		t.Fatalf("expected accepted, got %s failure=%+v", result.Status, result.FirstFailure)
	}
}

func TestPythonInPlaceArrayMutation(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "python")

	result, err := runner.Run(context.Background(), inPlaceArrayRequest("python", `class Solution:
    def sortColors(self, nums):
        nums.sort()
`))
	if err != nil {
		t.Fatalf("run: %v", err)
	}
	if result.Status != StatusAccepted {
		t.Fatalf("expected accepted, got %s failure=%+v", result.Status, result.FirstFailure)
	}
}

func TestTypeScriptInPlaceArrayMutation(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "typescript")

	result, err := runner.Run(context.Background(), inPlaceArrayRequest("typescript", `class Solution {
  sortColors(nums: number[]): void {
    nums.sort((left, right) => left - right)
  }
}

export { Solution }
`))
	if err != nil {
		t.Fatalf("run: %v", err)
	}
	if result.Status != StatusAccepted {
		t.Fatalf("expected accepted, got %s failure=%+v", result.Status, result.FirstFailure)
	}
}

func TestPythonInPlaceNodeMutation(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "python")

	result, err := runner.Run(context.Background(), inPlaceNodeRequest("python", `class Solution:
    def double(self, head):
        node = head
        while node:
            node.val *= 2
            node = node.next
`))
	if err != nil {
		t.Fatalf("run: %v", err)
	}
	if result.Status != StatusAccepted {
		t.Fatalf("expected accepted, got %s failure=%+v", result.Status, result.FirstFailure)
	}
}

func TestTypeScriptInPlaceNodeMutation(t *testing.T) {
	runner := NewRunner()
	requireRuntime(t, runner, "typescript")

	result, err := runner.Run(context.Background(), inPlaceNodeRequest("typescript", `class Solution {
  double(head: ListNode | null): void {
    let node = head
    while (node) {
      node.val *= 2
      node = node.next
    }
  }
}

export { Solution }
`))
	if err != nil {
		t.Fatalf("run: %v", err)
	}
	if result.Status != StatusAccepted {
		t.Fatalf("expected accepted, got %s failure=%+v", result.Status, result.FirstFailure)
	}
}

func TestUnicodeAndEmptyInputs(t *testing.T) {
	for _, language := range []string{"python", "typescript"} {
		t.Run(language, func(t *testing.T) {
			runner := NewRunner()
			requireRuntime(t, runner, language)

			code := `class Solution:
    def echo(self, text):
        return text
`
			if language == "typescript" {
				code = `class Solution {
  echo(text: string): string {
    return text
  }
}

export { Solution }
`
			}

			request := RunRequest{
				ProblemID: "test/echo",
				Language:  language,
				Code:      code,
				Mode:      "sample",
				Signature: Signature{
					Kind:      "function",
					ClassName: "Solution",
					Method:    "echo",
					Params:    []Param{{Name: "text", Type: "string"}},
					Returns:   "string",
					Mutates:   []string{},
				},
				Limits:  Limits{TimeMs: 2000, MemoryMb: 256},
				Checker: Checker{Kind: "exact"},
				Tests: []Test{
					{Index: 0, IsSample: true, Input: json.RawMessage(`{"text":"héllo 🌍"}`), Expected: json.RawMessage(`"héllo 🌍"`)},
					{Index: 1, IsSample: true, Input: json.RawMessage(`{"text":""}`), Expected: json.RawMessage(`""`)},
				},
			}

			result, err := runner.Run(context.Background(), request)
			if err != nil {
				t.Fatalf("run: %v", err)
			}
			if result.Status != StatusAccepted {
				t.Fatalf("expected accepted, got %s failure=%+v", result.Status, result.FirstFailure)
			}
		})
	}
}

func TestLargeInput(t *testing.T) {
	values := make([]int, 20000)
	for index := range values {
		values[index] = 1
	}
	input, err := json.Marshal(map[string]any{"nums": values})
	if err != nil {
		t.Fatalf("marshal input: %v", err)
	}

	for _, language := range []string{"python", "typescript"} {
		t.Run(language, func(t *testing.T) {
			runner := NewRunner()
			requireRuntime(t, runner, language)

			code := `class Solution:
    def total(self, nums):
        return sum(nums)
`
			if language == "typescript" {
				code = `class Solution {
  total(nums: number[]): number {
    return nums.reduce((sum, value) => sum + value, 0)
  }
}

export { Solution }
`
			}

			request := RunRequest{
				ProblemID: "test/total",
				Language:  language,
				Code:      code,
				Mode:      "sample",
				Signature: Signature{
					Kind:      "function",
					ClassName: "Solution",
					Method:    "total",
					Params:    []Param{{Name: "nums", Type: "int[]"}},
					Returns:   "int",
					Mutates:   []string{},
				},
				Limits:  Limits{TimeMs: 5000, MemoryMb: 256},
				Checker: Checker{Kind: "exact"},
				Tests: []Test{
					{Index: 0, IsSample: true, Input: input, Expected: json.RawMessage(`20000`)},
					{Index: 1, IsSample: true, Input: json.RawMessage(`{"nums":[]}`), Expected: json.RawMessage(`0`)},
				},
			}

			result, err := runner.Run(context.Background(), request)
			if err != nil {
				t.Fatalf("run: %v", err)
			}
			if result.Status != StatusAccepted {
				t.Fatalf("expected accepted, got %s failure=%+v", result.Status, result.FirstFailure)
			}
		})
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
