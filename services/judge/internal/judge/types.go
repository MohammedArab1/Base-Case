package judge

import (
	"encoding/json"
	"errors"
)

var (
	ErrInvalidRequest = errors.New("invalid request")
	ErrRuntimeMissing = errors.New("runtime missing")
)

const (
	StatusAccepted            = "accepted"
	StatusWrongAnswer         = "wrong_answer"
	StatusCompileError        = "compile_error"
	StatusRuntimeError        = "runtime_error"
	StatusTimeLimitExceeded   = "time_limit_exceeded"
	StatusMemoryLimitExceeded = "memory_limit_exceeded"
	StatusOutputLimitExceeded = "output_limit_exceeded"
	StatusInternalError       = "internal_error"
	StatusCancelled           = "cancelled"
)

type Param struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type Signature struct {
	Kind      string   `json:"kind"`
	ClassName string   `json:"className"`
	Method    string   `json:"method"`
	Params    []Param  `json:"params"`
	Returns   string   `json:"returns"`
	Mutates   []string `json:"mutates"`
}

type Limits struct {
	TimeMs              int                `json:"timeMs"`
	MemoryMb            int                `json:"memoryMb"`
	LanguageMultipliers map[string]float64 `json:"languageMultipliers,omitempty"`
}

type Checker struct {
	Kind              string   `json:"kind"`
	AbsoluteTolerance *float64 `json:"absoluteTolerance,omitempty"`
	RelativeTolerance *float64 `json:"relativeTolerance,omitempty"`
}

type Test struct {
	Index    int             `json:"index"`
	IsSample bool            `json:"isSample"`
	Input    json.RawMessage `json:"input"`
	Expected json.RawMessage `json:"expected"`
}

type RunRequest struct {
	ProblemID string    `json:"problemId"`
	Language  string    `json:"language"`
	Code      string    `json:"code"`
	Mode      string    `json:"mode"`
	Signature Signature `json:"signature"`
	Limits    Limits    `json:"limits"`
	Checker   Checker   `json:"checker"`
	Tests     []Test    `json:"tests"`
}

type HarnessError struct {
	Type     string `json:"type"`
	Message  string `json:"message"`
	Stack    string `json:"stack"`
	UserLine int    `json:"userLine"`
}

type CompileResult struct {
	OK         bool   `json:"ok"`
	Stdout     string `json:"stdout"`
	Stderr     string `json:"stderr"`
	DurationMs int64  `json:"durationMs"`
}

type RuntimeSummary struct {
	TotalMs         int64 `json:"totalMs"`
	MaxMs           int64 `json:"maxMs"`
	PeakMemoryBytes int64 `json:"peakMemoryBytes"`
}

type Failure struct {
	Index       int             `json:"index"`
	IsSample    bool            `json:"isSample"`
	Status      string          `json:"status"`
	Input       json.RawMessage `json:"input,omitempty"`
	Expected    json.RawMessage `json:"expected,omitempty"`
	Actual      json.RawMessage `json:"actual,omitempty"`
	UserStdout  string          `json:"userStdout"`
	UserStderr  string          `json:"userStderr"`
	RuntimeMs   int64           `json:"runtimeMs"`
	MemoryBytes int64           `json:"memoryBytes"`
	Error       *HarnessError   `json:"error,omitempty"`
	Message     string          `json:"message,omitempty"`
}

type TestResult struct {
	Index       int    `json:"index"`
	IsSample    bool   `json:"isSample"`
	Status      string `json:"status"`
	RuntimeMs   int64  `json:"runtimeMs"`
	MemoryBytes int64  `json:"memoryBytes"`
}

type RunResult struct {
	Status       string         `json:"status"`
	Passed       int            `json:"passed"`
	Total        int            `json:"total"`
	Compile      CompileResult  `json:"compile"`
	Runtime      RuntimeSummary `json:"runtime"`
	FirstFailure *Failure       `json:"firstFailure,omitempty"`
	Tests        []TestResult   `json:"tests"`
	Message      string         `json:"message,omitempty"`
}

type harnessResponse struct {
	OK         bool                       `json:"ok"`
	Result     json.RawMessage            `json:"result"`
	Mutated    map[string]json.RawMessage `json:"mutated"`
	UserStdout string                     `json:"userStdout"`
	UserStderr string                     `json:"userStderr"`
	DurationMs float64                    `json:"durationMs"`
	Error      *HarnessError              `json:"error"`
}
