package judge

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync/atomic"
	"time"
)

const (
	memorySampleInterval = 100 * time.Millisecond
	maxProcessCount      = 64
)

type testOutcome struct {
	Status      string
	Actual      json.RawMessage
	UserStdout  string
	UserStderr  string
	DurationMs  int64
	MemoryBytes int64
	Error       *HarnessError
	Message     string
}

func (r *Runner) Run(ctx context.Context, request RunRequest) (RunResult, error) {
	return r.run(ctx, request, nil)
}

// RunWithEvents behaves like Run and additionally emits one TestResult after
// each test. Events are best-effort progress updates; the final RunResult is
// authoritative.
func (r *Runner) RunWithEvents(
	ctx context.Context,
	request RunRequest,
	emit func(TestResult),
) (RunResult, error) {
	return r.run(ctx, request, emit)
}

func (r *Runner) run(
	ctx context.Context,
	request RunRequest,
	emit func(TestResult),
) (RunResult, error) {
	if err := validateRequest(request); err != nil {
		return RunResult{}, err
	}

	language := normalizeLanguage(request.Language)
	runtimePath, err := r.runtimeFor(language)
	if err != nil {
		return RunResult{}, err
	}

	workspace, err := os.MkdirTemp(r.TempRoot, "base-case-judge-*")
	if err != nil {
		return RunResult{}, fmt.Errorf("create workspace: %w", err)
	}
	defer os.RemoveAll(workspace)

	if err := writeWorkspace(workspace, language, request); err != nil {
		return RunResult{}, err
	}

	compile := compileWorkspace(ctx, workspace, language, runtimePath)

	result := RunResult{
		Status:  StatusAccepted,
		Total:   len(request.Tests),
		Compile: compile,
		Tests:   make([]TestResult, 0, len(request.Tests)),
	}

	if ctx.Err() != nil {
		result.Status = StatusCancelled
		result.Message = "The run was cancelled."
		return result, nil
	}

	if !compile.OK {
		result.Status = StatusCompileError
		result.Message = "The code could not be compiled or imported."

		if len(request.Tests) > 0 {
			first := request.Tests[0]
			result.FirstFailure = &Failure{
				Index:      first.Index,
				IsSample:   first.IsSample,
				Status:     StatusCompileError,
				Input:      first.Input,
				Expected:   first.Expected,
				UserStdout: compile.Stdout,
				UserStderr: compile.Stderr,
				Message:    result.Message,
			}
		}

		return result, nil
	}

	for _, test := range request.Tests {
		if ctx.Err() != nil {
			result.Status = StatusCancelled
			result.Message = "The run was cancelled."
			break
		}

		outcome := r.runTest(ctx, workspace, language, runtimePath, request, test)

		testResult := TestResult{
			Index:       test.Index,
			IsSample:    test.IsSample,
			Status:      outcome.Status,
			RuntimeMs:   outcome.DurationMs,
			MemoryBytes: outcome.MemoryBytes,
		}
		result.Tests = append(result.Tests, testResult)
		if emit != nil {
			emit(testResult)
		}
		result.Runtime.TotalMs += outcome.DurationMs
		if outcome.DurationMs > result.Runtime.MaxMs {
			result.Runtime.MaxMs = outcome.DurationMs
		}
		if outcome.MemoryBytes > result.Runtime.PeakMemoryBytes {
			result.Runtime.PeakMemoryBytes = outcome.MemoryBytes
		}

		if outcome.Status == StatusAccepted {
			result.Passed++
			continue
		}

		if result.FirstFailure == nil {
			result.FirstFailure = &Failure{
				Index:       test.Index,
				IsSample:    test.IsSample,
				Status:      outcome.Status,
				Input:       test.Input,
				Expected:    test.Expected,
				Actual:      outcome.Actual,
				UserStdout:  outcome.UserStdout,
				UserStderr:  outcome.UserStderr,
				RuntimeMs:   outcome.DurationMs,
				MemoryBytes: outcome.MemoryBytes,
				Error:       outcome.Error,
				Message:     outcome.Message,
			}
			result.Status = outcome.Status
		}

		if outcome.Status == StatusCompileError {
			result.Compile.OK = false
			result.Compile.Stderr = formatCompileError(outcome)
			result.Message = "The code could not be compiled or imported."
			break
		}

		// Stop at the first non-compile failure. Running every remaining test
		// would turn a slow answer into a minute-long timeout storm, especially
		// in submit mode where 39 hidden tests can each hit the time limit.
		break
	}

	if result.Passed == result.Total && result.Status != StatusCancelled {
		result.Status = StatusAccepted
	}

	return result, nil
}

var supportedParamTypes = map[string]struct{}{
	"int": {}, "long": {}, "double": {}, "boolean": {}, "string": {}, "char": {},
	"int[]": {}, "long[]": {}, "double[]": {}, "boolean[]": {}, "string[]": {},
	"int[][]": {}, "string[][]": {}, "ListNode": {}, "TreeNode": {},
}

var supportedReturnTypes = map[string]struct{}{
	"int": {}, "long": {}, "double": {}, "boolean": {}, "string": {}, "char": {},
	"int[]": {}, "long[]": {}, "double[]": {}, "boolean[]": {}, "string[]": {},
	"int[][]": {}, "string[][]": {}, "ListNode": {}, "TreeNode": {}, "void": {},
}

func validateRequest(request RunRequest) error {
	language := normalizeLanguage(request.Language)
	if language != "python" && language != "typescript" && language != "javascript" {
		return fmt.Errorf("%w: unsupported language %q", ErrInvalidRequest, request.Language)
	}

	if request.Signature.Kind != "function" {
		return fmt.Errorf("%w: only function signatures are supported in the Phase 1 judge", ErrInvalidRequest)
	}

	if strings.TrimSpace(request.Signature.ClassName) == "" {
		return fmt.Errorf("%w: signature.className is required", ErrInvalidRequest)
	}

	if strings.TrimSpace(request.Signature.Method) == "" {
		return fmt.Errorf("%w: signature.method is required", ErrInvalidRequest)
	}

	params := make(map[string]bool, len(request.Signature.Params))
	for _, param := range request.Signature.Params {
		if strings.TrimSpace(param.Name) == "" {
			return fmt.Errorf("%w: signature params must have a name", ErrInvalidRequest)
		}
		if _, ok := supportedParamTypes[param.Type]; !ok {
			return fmt.Errorf("%w: unsupported parameter type %q", ErrInvalidRequest, param.Type)
		}
		if params[param.Name] {
			return fmt.Errorf("%w: duplicate parameter %q", ErrInvalidRequest, param.Name)
		}
		params[param.Name] = true
	}

	if _, ok := supportedReturnTypes[request.Signature.Returns]; !ok {
		return fmt.Errorf("%w: unsupported return type %q", ErrInvalidRequest, request.Signature.Returns)
	}

	mutates := make(map[string]bool, len(request.Signature.Mutates))
	for _, name := range request.Signature.Mutates {
		if !params[name] {
			return fmt.Errorf("%w: mutates references unknown parameter %q", ErrInvalidRequest, name)
		}
		if mutates[name] {
			return fmt.Errorf("%w: duplicate mutates entry %q", ErrInvalidRequest, name)
		}
		mutates[name] = true
	}

	if len(request.Tests) == 0 {
		return fmt.Errorf("%w: at least one test is required", ErrInvalidRequest)
	}

	if len(request.Tests) > 500 {
		return fmt.Errorf("%w: too many tests (max 500)", ErrInvalidRequest)
	}

	if request.Mode != "" && request.Mode != "sample" && request.Mode != "submit" && request.Mode != "review" {
		return fmt.Errorf("%w: unsupported mode %q", ErrInvalidRequest, request.Mode)
	}

	return nil
}

func normalizeLanguage(language string) string {
	switch language {
	case "py":
		return "python"
	case "ts":
		return "typescript"
	case "js":
		return "javascript"
	default:
		return language
	}
}

func writeWorkspace(workspace, language string, request RunRequest) error {
	var solutionName string
	var harnessName string
	var harness string

	switch language {
	case "python":
		solutionName = "solution.py"
		harnessName = "harness.py"
		harness = pythonHarness(request.Signature)
	case "typescript":
		solutionName = "solution.ts"
		harnessName = "harness.mjs"
		harness = typescriptHarness(request.Signature, "./solution.mjs")
	case "javascript":
		solutionName = "solution.mjs"
		harnessName = "harness.mjs"
		harness = typescriptHarness(request.Signature, "./solution.mjs")
	default:
		return fmt.Errorf("%w: unsupported language %q", ErrInvalidRequest, language)
	}

	if err := os.WriteFile(filepath.Join(workspace, solutionName), []byte(request.Code), 0o600); err != nil {
		return fmt.Errorf("write solution: %w", err)
	}

	if err := os.WriteFile(filepath.Join(workspace, harnessName), []byte(harness), 0o600); err != nil {
		return fmt.Errorf("write harness: %w", err)
	}

	return nil
}

func (r *Runner) runTest(
	parent context.Context,
	workspace string,
	language string,
	runtimePath string,
	request RunRequest,
	test Test,
) testOutcome {
	inputEnvelope, err := json.Marshal(map[string]json.RawMessage{"input": test.Input})
	if err != nil {
		return testOutcome{
			Status:  StatusInternalError,
			Message: fmt.Sprintf("encode test input: %v", err),
		}
	}

	if parent.Err() != nil {
		return testOutcome{
			Status:  StatusCancelled,
			Message: "The run was cancelled.",
		}
	}

	timeout := time.Duration(effectiveTimeLimit(request)) * time.Millisecond
	testContext, cancel := context.WithTimeout(parent, timeout)
	defer cancel()

	command := commandFor(language, runtimePath, request)
	command.Dir = workspace
	command.Env = sanitizedEnv(workspace, filepath.Dir(runtimePath))
	command.Stdin = bytes.NewReader(inputEnvelope)

	stdout, stdoutOverflow := newCappedBuffer(r.outputLimit())
	stderr, stderrOverflow := newCappedBuffer(r.outputLimit())
	command.Stdout = stdout
	command.Stderr = stderr

	if r.Sandbox {
		command = sandboxCommand(command, workspace, runtimePath)
	}
	configureProcess(command)

	started := time.Now()
	if err := command.Start(); err != nil {
		return testOutcome{
			Status:     StatusInternalError,
			DurationMs: time.Since(started).Milliseconds(),
			Message:    fmt.Sprintf("start runtime: %v", err),
		}
	}

	memoryLimitBytes := int64(effectiveMemoryMb(request)) * 1024 * 1024

	// On Windows this places the child in a kill-on-close Job Object so the
	// runtime tree cannot outlive the judge, even if the judge is killed. The
	// job also carries memory, CPU, and process-count limits as a backstop.
	guard := guardProcess(command.Process.Pid, processLimits{
		MemoryBytes:  memoryLimitBytes,
		CPUTime:      timeout * 2,
		MaxProcesses: maxProcessCount,
	})
	defer guard.release()

	waitChannel := make(chan error, 1)
	go func() {
		waitChannel <- command.Wait()
	}()

	memoryExceeded := make(chan struct{}, 1)
	processExceeded := make(chan struct{}, 1)
	samplerStop := make(chan struct{})
	samplerDone := make(chan struct{})
	var sampledPeak atomic.Int64

	go func() {
		defer close(samplerDone)

		ticker := time.NewTicker(memorySampleInterval)
		defer ticker.Stop()

		for {
			select {
			case <-samplerStop:
				return
			case <-ticker.C:
				current, count := processTreeStats(command.Process.Pid)
				if current > sampledPeak.Load() {
					sampledPeak.Store(current)
				}

				if count > maxProcessCount {
					select {
					case processExceeded <- struct{}{}:
					default:
					}
					return
				}

				if current > memoryLimitBytes {
					select {
					case memoryExceeded <- struct{}{}:
					default:
					}
					return
				}
			}
		}
	}()

	forcedStatus := ""
	forcedMessage := ""
	var waitError error

	select {
	case waitError = <-waitChannel:
	case <-testContext.Done():
		killProcessGroup(command.Process.Pid)
		waitError = <-waitChannel
		if errors.Is(testContext.Err(), context.DeadlineExceeded) {
			forcedStatus = StatusTimeLimitExceeded
		} else {
			forcedStatus = StatusCancelled
		}
	case <-stdoutOverflow:
		killProcessGroup(command.Process.Pid)
		waitError = <-waitChannel
		forcedStatus = StatusOutputLimitExceeded
	case <-stderrOverflow:
		killProcessGroup(command.Process.Pid)
		waitError = <-waitChannel
		forcedStatus = StatusOutputLimitExceeded
	case <-memoryExceeded:
		killProcessGroup(command.Process.Pid)
		waitError = <-waitChannel
		forcedStatus = StatusMemoryLimitExceeded
	case <-processExceeded:
		killProcessGroup(command.Process.Pid)
		waitError = <-waitChannel
		forcedStatus = StatusRuntimeError
		forcedMessage = fmt.Sprintf("Execution exceeded its process limit (%d).", maxProcessCount)
	}

	close(samplerStop)
	<-samplerDone

	peakMemory := guard.peak(command.ProcessState)
	if sampled := sampledPeak.Load(); sampled > peakMemory {
		peakMemory = sampled
	}

	// A fast allocation can finish between samples. The kernel high-water mark
	// still catches it, so report the limit instead of a misleading pass/fail.
	if forcedStatus == "" && peakMemory > memoryLimitBytes {
		forcedStatus = StatusMemoryLimitExceeded
	}

	duration := time.Since(started).Milliseconds()
	userStdout := stdout.String()
	userStderr := stderr.String()

	if forcedStatus != "" {
		message := forcedMessage
		if message == "" {
			message = "Execution exceeded its time limit."
			switch forcedStatus {
			case StatusOutputLimitExceeded:
				message = "Execution produced too much output and was stopped."
			case StatusCancelled:
				message = "The run was cancelled."
			case StatusMemoryLimitExceeded:
				message = "Execution exceeded its memory limit."
			}
		}
		return testOutcome{
			Status:      forcedStatus,
			UserStdout:  userStdout,
			UserStderr:  userStderr,
			DurationMs:  duration,
			MemoryBytes: peakMemory,
			Message:     message,
		}
	}

	response, ok := parseHarnessOutput(userStdout)
	if !ok {
		status := StatusRuntimeError
		message := "The program exited without producing a harness result."
		if waitError == nil {
			status = StatusInternalError
			message = "The harness produced no result."
		}
		return testOutcome{
			Status:      status,
			UserStdout:  userStdout,
			UserStderr:  userStderr,
			DurationMs:  duration,
			MemoryBytes: peakMemory,
			Message:     message,
		}
	}

	if !response.OK {
		status := StatusRuntimeError
		if response.Error != nil && strings.Contains(response.Error.Type, "SyntaxError") {
			status = StatusCompileError
		}
		return testOutcome{
			Status:      status,
			UserStdout:  response.UserStdout,
			UserStderr:  response.UserStderr,
			DurationMs:  duration,
			MemoryBytes: peakMemory,
			Error:       response.Error,
		}
	}

	actual, err := buildActual(response, request)
	if err != nil {
		return testOutcome{
			Status:      StatusInternalError,
			UserStdout:  response.UserStdout,
			UserStderr:  response.UserStderr,
			DurationMs:  duration,
			MemoryBytes: peakMemory,
			Message:     fmt.Sprintf("build actual value: %v", err),
		}
	}

	passed, err := compareValues(test.Expected, actual, request.Checker)
	if err != nil {
		return testOutcome{
			Status:      StatusInternalError,
			Actual:      actual,
			UserStdout:  response.UserStdout,
			UserStderr:  response.UserStderr,
			DurationMs:  duration,
			MemoryBytes: peakMemory,
			Message:     fmt.Sprintf("compare result: %v", err),
		}
	}

	if passed {
		return testOutcome{
			Status:      StatusAccepted,
			Actual:      actual,
			UserStdout:  response.UserStdout,
			UserStderr:  response.UserStderr,
			DurationMs:  duration,
			MemoryBytes: peakMemory,
		}
	}

	return testOutcome{
		Status:      StatusWrongAnswer,
		Actual:      actual,
		UserStdout:  response.UserStdout,
		UserStderr:  response.UserStderr,
		DurationMs:  duration,
		MemoryBytes: peakMemory,
		Message:     "The result does not match the expected value.",
	}
}

func commandFor(language, runtimePath string, request RunRequest) *exec.Cmd {
	if language == "python" {
		return exec.Command(runtimePath, "-I", "-B", "harness.py")
	}

	args := []string{
		"--no-warnings",
		"--enable-source-maps",
		fmt.Sprintf("--max-old-space-size=%d", effectiveMemoryMb(request)),
		"harness.mjs",
	}

	return exec.Command(runtimePath, args...)
}

func parseHarnessOutput(output string) (harnessResponse, bool) {
	lines := strings.Split(output, "\n")

	for index := len(lines) - 1; index >= 0; index-- {
		line := strings.TrimSpace(lines[index])
		if line == "" {
			continue
		}

		var response harnessResponse
		if err := json.Unmarshal([]byte(line), &response); err == nil {
			if response.OK || response.Error != nil {
				return response, true
			}
		}
	}

	return harnessResponse{}, false
}

func buildActual(response harnessResponse, request RunRequest) (json.RawMessage, error) {
	if len(request.Signature.Mutates) == 0 {
		if len(response.Result) == 0 {
			return json.RawMessage("null"), nil
		}
		return response.Result, nil
	}

	returnValue := response.Result
	if len(returnValue) == 0 {
		returnValue = json.RawMessage("null")
	}

	mutated := make(map[string]json.RawMessage, len(request.Signature.Mutates))
	for _, name := range request.Signature.Mutates {
		if value, ok := response.Mutated[name]; ok {
			mutated[name] = value
		}
	}

	combined, err := json.Marshal(map[string]any{
		"returnValue": returnValue,
		"mutated":     mutated,
	})
	if err != nil {
		return nil, err
	}

	return combined, nil
}

func formatCompileError(outcome testOutcome) string {
	if outcome.Error == nil {
		return outcome.Message
	}
	if outcome.Error.Stack != "" {
		return outcome.Error.Stack
	}
	return fmt.Sprintf("%s: %s", outcome.Error.Type, outcome.Error.Message)
}

func effectiveTimeLimit(request RunRequest) int {
	limit := request.Limits.TimeMs
	if limit <= 0 {
		limit = 2000
	}

	if multiplier, ok := request.Limits.LanguageMultipliers[request.Language]; ok && multiplier > 0 {
		limit = int(float64(limit) * multiplier)
	}

	if limit < 100 {
		return 100
	}
	if limit > 60000 {
		return 60000
	}
	return limit
}

func effectiveMemoryMb(request RunRequest) int {
	memory := request.Limits.MemoryMb
	if memory <= 0 {
		memory = 256
	}

	if multiplier, ok := request.Limits.LanguageMultipliers[request.Language]; ok && multiplier > 0 {
		memory = int(float64(memory) * multiplier)
	}

	if memory < 32 {
		return 32
	}
	if memory > 4096 {
		return 4096
	}
	return memory
}

func sanitizedEnv(workspace, runtimeDirectory string) []string {
	pathEntries := []string{runtimeDirectory}
	if path := os.Getenv("PATH"); path != "" {
		pathEntries = append(pathEntries, path)
	}

	environment := []string{
		"PATH=" + strings.Join(pathEntries, string(os.PathListSeparator)),
		"TZ=UTC",
		"LANG=en_US.UTF-8",
		"LC_ALL=en_US.UTF-8",
		"PYTHONIOENCODING=utf-8",
		"PYTHONNOUSERSITE=1",
		"PYTHONHASHSEED=0",
		"PYTHONDONTWRITEBYTECODE=1",
		"NODE_NO_WARNINGS=1",
		"NO_COLOR=1",
		"HOME=" + workspace,
		"USERPROFILE=" + workspace,
		"TMPDIR=" + workspace,
		"TEMP=" + workspace,
		"TMP=" + workspace,
	}

	if runtime.GOOS == "windows" {
		for _, key := range []string{"SystemRoot", "WINDIR", "COMSPEC", "PATHEXT"} {
			if value := os.Getenv(key); value != "" {
				environment = append(environment, key+"="+value)
			}
		}
	}

	return environment
}
