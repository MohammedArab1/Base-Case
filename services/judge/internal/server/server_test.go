package server_test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"strings"
	"testing"
	"time"

	"github.com/base-case/base-case/services/judge/internal/judge"
	"github.com/base-case/base-case/services/judge/internal/protocol"
	"github.com/base-case/base-case/services/judge/internal/server"
)

func newServer() *server.Server {
	return server.New(server.Info{
		Name:            "base-case-judge",
		Version:         "test",
		ProtocolVersion: protocol.Version,
	})
}

func serve(t *testing.T, input string) []protocol.Response {
	t.Helper()

	var output bytes.Buffer
	err := newServer().Serve(strings.NewReader(input), &output)
	if err != nil {
		t.Fatalf("serve: %v", err)
	}

	decoder := json.NewDecoder(&output)
	var responses []protocol.Response
	for {
		var response protocol.Response
		if err := decoder.Decode(&response); err != nil {
			if errors.Is(err, io.EOF) {
				break
			}
			t.Fatalf("decode response: %v", err)
		}
		responses = append(responses, response)
	}

	return responses
}

func TestPing(t *testing.T) {
	responses := serve(t, `{"id":"1","method":"ping"}`+"\n")

	if len(responses) != 1 {
		t.Fatalf("expected 1 response, got %d", len(responses))
	}
	if responses[0].ID != "1" || !responses[0].OK {
		t.Fatalf("unexpected response: %+v", responses[0])
	}
}

func TestHello(t *testing.T) {
	responses := serve(t, `{"id":"hello-1","method":"hello"}`+"\n")

	if len(responses) != 1 || !responses[0].OK {
		t.Fatalf("unexpected responses: %+v", responses)
	}

	result, ok := responses[0].Result.(map[string]any)
	if !ok {
		t.Fatalf("expected result object, got %T", responses[0].Result)
	}
	if result["name"] != "base-case-judge" {
		t.Fatalf("unexpected name: %v", result["name"])
	}
	if result["protocolVersion"] != float64(protocol.Version) {
		t.Fatalf("unexpected protocol version: %v", result["protocolVersion"])
	}
}

func TestUnknownMethod(t *testing.T) {
	responses := serve(t, `{"id":"2","method":"nope"}`+"\n")

	if len(responses) != 1 {
		t.Fatalf("expected 1 response, got %d", len(responses))
	}
	if responses[0].OK {
		t.Fatal("expected failure response")
	}
	if responses[0].Error == nil || responses[0].Error.Code != "unknown_method" {
		t.Fatalf("unexpected error: %+v", responses[0].Error)
	}
}

func TestInvalidJSON(t *testing.T) {
	responses := serve(t, `{"id":`+"\n")

	if len(responses) != 1 {
		t.Fatalf("expected 1 response, got %d", len(responses))
	}
	if responses[0].OK {
		t.Fatal("expected failure response")
	}
	if responses[0].Error == nil || responses[0].Error.Code != "invalid_json" {
		t.Fatalf("unexpected error: %+v", responses[0].Error)
	}
}

func TestMissingMethod(t *testing.T) {
	responses := serve(t, `{"id":"3"}`+"\n")

	if len(responses) != 1 || responses[0].OK {
		t.Fatalf("unexpected responses: %+v", responses)
	}
	if responses[0].Error == nil || responses[0].Error.Code != "invalid_request" {
		t.Fatalf("unexpected error: %+v", responses[0].Error)
	}
}

func TestShutdownStopsReading(t *testing.T) {
	responses := serve(t, `{"id":"4","method":"shutdown"}`+"\n"+`{"id":"5","method":"ping"}`+"\n")

	if len(responses) != 1 {
		t.Fatalf("expected 1 response, got %d", len(responses))
	}
	if responses[0].ID != "4" || !responses[0].OK {
		t.Fatalf("unexpected response: %+v", responses[0])
	}
}

func TestBlankLinesAreIgnored(t *testing.T) {
	responses := serve(t, "\n\n"+`{"id":"6","method":"ping"}`+"\n\n")

	if len(responses) != 1 {
		t.Fatalf("expected 1 response, got %d", len(responses))
	}
}

// fakeRunner blocks a run until it is released or its context is cancelled. It
// lets protocol tests exercise concurrency without requiring Python or Node.
type fakeRunner struct {
	started chan struct{}
	release chan struct{}
}

func newFakeRunner() *fakeRunner {
	return &fakeRunner{
		started: make(chan struct{}, 1),
		release: make(chan struct{}),
	}
}

func (f *fakeRunner) Run(
	ctx context.Context,
	request judge.RunRequest,
) (judge.RunResult, error) {
	return f.RunWithEvents(ctx, request, nil)
}

func (f *fakeRunner) RunWithEvents(
	ctx context.Context,
	request judge.RunRequest,
	emit func(judge.TestResult),
) (judge.RunResult, error) {
	f.started <- struct{}{}

	if emit != nil {
		emit(judge.TestResult{Index: 0, Status: judge.StatusAccepted, RuntimeMs: 3})
	}

	select {
	case <-f.release:
		return judge.RunResult{
			Status: judge.StatusAccepted,
			Passed: len(request.Tests),
			Total:  len(request.Tests),
		}, nil
	case <-ctx.Done():
		return judge.RunResult{Status: judge.StatusCancelled, Total: len(request.Tests)}, nil
	}
}

func (f *fakeRunner) Doctor(context.Context) map[string]judge.RuntimeInfo {
	return map[string]judge.RuntimeInfo{}
}

const runLine = `{"id":"run-1","method":"run","params":{"language":"python","signature":{"kind":"function","className":"Solution","method":"pairSum"},"tests":[{"index":0,"input":{},"expected":null}]}}`

type session struct {
	t         *testing.T
	input     *io.PipeWriter
	responses chan protocol.Response
	done      chan error
}

func startSession(t *testing.T, runner server.Runner) *session {
	t.Helper()

	inputReader, inputWriter := io.Pipe()
	outputReader, outputWriter := io.Pipe()

	srv := server.NewWithRunner(server.Info{
		Name:            "base-case-judge",
		Version:         "test",
		ProtocolVersion: protocol.Version,
	}, runner)

	done := make(chan error, 1)
	go func() {
		done <- srv.Serve(inputReader, outputWriter)
		_ = outputWriter.Close()
	}()

	responses := make(chan protocol.Response, 32)
	go func() {
		defer close(responses)
		decoder := json.NewDecoder(outputReader)
		for {
			var response protocol.Response
			if err := decoder.Decode(&response); err != nil {
				return
			}
			responses <- response
		}
	}()

	s := &session{t: t, input: inputWriter, responses: responses, done: done}
	t.Cleanup(s.close)
	return s
}

func (s *session) send(line string) {
	s.t.Helper()
	if _, err := io.WriteString(s.input, line+"\n"); err != nil {
		s.t.Fatalf("write request: %v", err)
	}
}

func (s *session) next(timeout time.Duration) protocol.Response {
	s.t.Helper()

	select {
	case response, ok := <-s.responses:
		if !ok {
			s.t.Fatal("response stream closed")
		}
		return response
	case <-time.After(timeout):
		s.t.Fatal("timed out waiting for a response")
		return protocol.Response{}
	}
}

// waitForID returns the final (non-event) response for id, skipping progress
// events that may arrive first.
func (s *session) waitForID(id string, timeout time.Duration) protocol.Response {
	s.t.Helper()

	deadline := time.After(timeout)
	for {
		select {
		case response, ok := <-s.responses:
			if !ok {
				s.t.Fatalf("response stream closed before %q", id)
			}
			if response.ID == id && response.Event == "" {
				return response
			}
		case <-deadline:
			s.t.Fatalf("timed out waiting for response %q", id)
		}
	}
}

func (s *session) close() {
	s.t.Helper()
	_ = s.input.Close()

	select {
	case err := <-s.done:
		if err != nil {
			s.t.Errorf("serve: %v", err)
		}
	case <-time.After(5 * time.Second):
		s.t.Error("serve did not stop")
	}
}

func TestRunStreamsEventsBeforeFinalResponse(t *testing.T) {
	runner := newFakeRunner()
	s := startSession(t, runner)

	s.send(runLine)
	<-runner.started

	event := s.next(5 * time.Second)
	if event.ID != "run-1" || event.Event != protocol.EventTestResult || !event.OK {
		t.Fatalf("unexpected event: %+v", event)
	}

	result, ok := event.Result.(map[string]any)
	if !ok || result["status"] != judge.StatusAccepted {
		t.Fatalf("unexpected event result: %#v", event.Result)
	}

	runner.release <- struct{}{}

	final := s.next(5 * time.Second)
	if final.ID != "run-1" || final.Event != "" || !final.OK {
		t.Fatalf("unexpected final response: %+v", final)
	}

	finalResult, ok := final.Result.(map[string]any)
	if !ok || finalResult["status"] != judge.StatusAccepted {
		t.Fatalf("unexpected final result: %#v", final.Result)
	}

	s.send(`{"id":"stop-1","method":"shutdown"}`)
	s.waitForID("stop-1", 5*time.Second)
}

func TestCancelStopsInFlightRun(t *testing.T) {
	runner := newFakeRunner()
	s := startSession(t, runner)

	s.send(runLine)
	<-runner.started

	// Drain the progress event emitted before the run blocks.
	event := s.next(5 * time.Second)
	if event.Event != protocol.EventTestResult {
		t.Fatalf("unexpected event: %+v", event)
	}

	s.send(`{"id":"cancel-1","method":"cancel","params":{"targetId":"run-1"}}`)

	cancelResponse := s.waitForID("cancel-1", 5*time.Second)
	cancelResult, ok := cancelResponse.Result.(map[string]any)
	if !ok || cancelResult["cancelled"] != true {
		t.Fatalf("unexpected cancel result: %#v", cancelResponse.Result)
	}

	final := s.waitForID("run-1", 5*time.Second)
	finalResult, ok := final.Result.(map[string]any)
	if !ok || finalResult["status"] != judge.StatusCancelled {
		t.Fatalf("unexpected final result: %#v", final.Result)
	}

	s.send(`{"id":"stop-1","method":"shutdown"}`)
	s.waitForID("stop-1", 5*time.Second)
}

func TestCancelUnknownRunReturnsFalse(t *testing.T) {
	s := startSession(t, newFakeRunner())

	s.send(`{"id":"cancel-1","method":"cancel","params":{"targetId":"missing"}}`)
	response := s.waitForID("cancel-1", 5*time.Second)

	result, ok := response.Result.(map[string]any)
	if !ok || result["cancelled"] != false {
		t.Fatalf("unexpected cancel result: %#v", response.Result)
	}
}

func TestCancelRequiresTargetID(t *testing.T) {
	s := startSession(t, newFakeRunner())

	s.send(`{"id":"cancel-1","method":"cancel","params":{}}`)
	response := s.waitForID("cancel-1", 5*time.Second)

	if response.Error == nil || response.Error.Code != "invalid_params" {
		t.Fatalf("unexpected error: %+v", response.Error)
	}
}

func TestPingIsHandledWhileRunIsActive(t *testing.T) {
	runner := newFakeRunner()
	s := startSession(t, runner)

	s.send(runLine)
	<-runner.started

	s.send(`{"id":"ping-1","method":"ping"}`)
	ping := s.waitForID("ping-1", 5*time.Second)
	if !ping.OK {
		t.Fatalf("unexpected ping response: %+v", ping)
	}

	runner.release <- struct{}{}
	s.waitForID("run-1", 5*time.Second)

	s.send(`{"id":"stop-1","method":"shutdown"}`)
	s.waitForID("stop-1", 5*time.Second)
}

func TestDuplicateRunIDIsRejected(t *testing.T) {
	runner := newFakeRunner()
	s := startSession(t, runner)

	s.send(runLine)
	<-runner.started
	s.send(runLine)

	response := s.waitForID("run-1", 5*time.Second)
	if response.Error == nil || response.Error.Code != "duplicate_request_id" {
		t.Fatalf("unexpected error: %+v", response.Error)
	}

	s.send(`{"id":"cancel-1","method":"cancel","params":{"targetId":"run-1"}}`)
	s.waitForID("cancel-1", 5*time.Second)
	s.waitForID("run-1", 5*time.Second)

	s.send(`{"id":"stop-1","method":"shutdown"}`)
	s.waitForID("stop-1", 5*time.Second)
}

func TestShutdownCancelsActiveRunBeforeResponding(t *testing.T) {
	runner := newFakeRunner()
	s := startSession(t, runner)

	s.send(runLine)
	<-runner.started

	// Drain the progress event emitted before the run blocks.
	event := s.next(5 * time.Second)
	if event.Event != protocol.EventTestResult {
		t.Fatalf("unexpected event: %+v", event)
	}

	s.send(`{"id":"stop-1","method":"shutdown"}`)

	first := s.next(5 * time.Second)
	if first.ID != "run-1" {
		t.Fatalf("expected the run to finish first, got %+v", first)
	}

	result, ok := first.Result.(map[string]any)
	if !ok || result["status"] != judge.StatusCancelled {
		t.Fatalf("unexpected run result: %#v", first.Result)
	}

	second := s.next(5 * time.Second)
	if second.ID != "stop-1" || !second.OK {
		t.Fatalf("unexpected shutdown response: %+v", second)
	}
}
