package protocol

import "encoding/json"

// Version is the wire protocol version spoken by the judge sidecar.
const Version = 1

const (
	MethodHello    = "hello"
	MethodPing     = "ping"
	MethodVersion  = "version"
	MethodDoctor   = "doctor"
	MethodRun      = "run"
	MethodCancel   = "cancel"
	MethodShutdown = "shutdown"
)

// EventTestResult is emitted once per test before the final run response.
const EventTestResult = "test_result"

// Request is one newline-delimited JSON request from the host application.
type Request struct {
	ID     string          `json:"id"`
	Method string          `json:"method"`
	Params json.RawMessage `json:"params,omitempty"`
}

// Error describes a structured protocol or judge failure.
type Error struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details any    `json:"details,omitempty"`
}

// Response is one newline-delimited JSON response. Event is set for streaming
// progress messages; the final response for a request leaves it empty.
type Response struct {
	ID     string `json:"id"`
	Event  string `json:"event,omitempty"`
	OK     bool   `json:"ok"`
	Result any    `json:"result,omitempty"`
	Error  *Error `json:"error,omitempty"`
}

// CancelParams asks the sidecar to stop an in-flight run.
type CancelParams struct {
	TargetID string `json:"targetId"`
}

// CancelResult reports whether a matching in-flight run was cancelled.
type CancelResult struct {
	Cancelled bool   `json:"cancelled"`
	TargetID  string `json:"targetId,omitempty"`
}

// HelloResult is returned by the hello and version methods.
type HelloResult struct {
	ProtocolVersion int    `json:"protocolVersion"`
	Name            string `json:"name"`
	Version         string `json:"version"`
	OS              string `json:"os"`
	Arch            string `json:"arch"`
	GoVersion       string `json:"goVersion"`
}

func Success(id string, result any) Response {
	return Response{ID: id, OK: true, Result: result}
}

// Event builds a streaming progress response for an in-flight request.
func Event(id, event string, result any) Response {
	return Response{ID: id, Event: event, OK: true, Result: result}
}

func Failure(id, code, message string) Response {
	return Response{
		ID: id,
		OK: false,
		Error: &Error{
			Code:    code,
			Message: message,
		},
	}
}
