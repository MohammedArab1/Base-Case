package server

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"runtime"
	"sync"
	"time"

	"github.com/base-case/base-case/services/judge/internal/judge"
	"github.com/base-case/base-case/services/judge/internal/protocol"
)

const (
	maxRequestBytes    = 1024 * 1024
	shutdownGraceLimit = 3 * time.Second
)

// Runner is the execution surface the server needs. *judge.Runner implements
// it; tests inject a fake so protocol behavior can be exercised without
// language runtimes.
type Runner interface {
	Run(ctx context.Context, request judge.RunRequest) (judge.RunResult, error)
	RunWithEvents(
		ctx context.Context,
		request judge.RunRequest,
		emit func(judge.TestResult),
	) (judge.RunResult, error)
	Doctor(ctx context.Context) map[string]judge.RuntimeInfo
}

// Info identifies the judge process in hello/version responses.
type Info struct {
	Name            string
	Version         string
	ProtocolVersion int
}

// Server handles newline-delimited JSON requests. Execution is delegated to a
// Runner; content loading and persistence stay in the host application.
//
// Requests are read continuously while runs execute in goroutines, so a cancel
// request can interrupt an in-flight run. All output goes through one mutex-
// guarded encoder; responses and events are correlated by request ID.
type Server struct {
	info   Info
	runner Runner

	writeMu  sync.Mutex
	encoder  *json.Encoder
	writeErr error

	mu         sync.Mutex
	rootCtx    context.Context
	rootCancel context.CancelFunc
	runs       map[string]context.CancelFunc
	runsWG     sync.WaitGroup
}

func New(info Info) *Server {
	return NewWithRunner(info, judge.NewRunner())
}

func NewWithRunner(info Info, runner Runner) *Server {
	return &Server{
		info:   info,
		runner: runner,
		runs:   make(map[string]context.CancelFunc),
	}
}

// Serve reads requests from input and writes responses to output. It returns
// nil when a shutdown request is handled or the input reaches EOF.
func (s *Server) Serve(input io.Reader, output io.Writer) error {
	scanner := bufio.NewScanner(input)
	scanner.Buffer(make([]byte, 64*1024), maxRequestBytes)

	s.writeMu.Lock()
	s.encoder = json.NewEncoder(output)
	s.writeMu.Unlock()

	s.mu.Lock()
	s.rootCtx, s.rootCancel = context.WithCancel(context.Background())
	s.mu.Unlock()

	defer func() {
		s.mu.Lock()
		if s.rootCancel != nil {
			s.rootCancel()
		}
		s.mu.Unlock()
	}()

	for scanner.Scan() {
		if err := s.writeError(); err != nil {
			break
		}

		line := bytes.TrimSpace(scanner.Bytes())
		if len(line) == 0 {
			continue
		}

		if s.handle(line) {
			s.stopRuns()
			if err := s.writeError(); err != nil {
				return err
			}
			return nil
		}
	}

	s.stopRuns()

	if err := s.writeError(); err != nil {
		return err
	}
	return scanner.Err()
}

func (s *Server) handle(line []byte) bool {
	var request protocol.Request
	if err := json.Unmarshal(line, &request); err != nil {
		s.write(protocol.Failure("", "invalid_json", "Request must be a JSON object."))
		return false
	}

	if request.Method == "" {
		s.write(protocol.Failure(request.ID, "invalid_request", "Request is missing a method."))
		return false
	}

	switch request.Method {
	case protocol.MethodHello, protocol.MethodVersion:
		s.write(protocol.Success(request.ID, s.helloResult()))
	case protocol.MethodPing:
		s.write(protocol.Success(request.ID, map[string]any{"pong": true}))
	case protocol.MethodDoctor:
		s.handleDoctor(request)
	case protocol.MethodRun:
		s.handleRun(request)
	case protocol.MethodCancel:
		s.handleCancel(request)
	case protocol.MethodShutdown:
		s.stopRuns()
		s.write(protocol.Success(request.ID, map[string]any{"stopping": true}))
		return true
	default:
		s.write(protocol.Failure(
			request.ID,
			"unknown_method",
			fmt.Sprintf("Unknown method %q.", request.Method),
		))
	}

	return false
}

// handleDoctor probes runtimes off the read loop so a slow probe cannot delay
// a cancel or shutdown request.
func (s *Server) handleDoctor(request protocol.Request) {
	s.mu.Lock()
	root := s.rootCtx
	if root == nil {
		s.mu.Unlock()
		s.write(protocol.Failure(request.ID, "internal_error", "The judge server is not running."))
		return
	}
	s.runsWG.Add(1)
	s.mu.Unlock()

	go func() {
		defer s.runsWG.Done()
		s.write(protocol.Success(request.ID, s.runner.Doctor(root)))
	}()
}

func (s *Server) handleRun(request protocol.Request) {
	if request.ID == "" {
		s.write(protocol.Failure("", "invalid_request", "run requires a request id."))
		return
	}

	if len(request.Params) == 0 {
		s.write(protocol.Failure(request.ID, "invalid_params", "run requires params."))
		return
	}

	var runRequest judge.RunRequest
	if err := json.Unmarshal(request.Params, &runRequest); err != nil {
		s.write(protocol.Failure(request.ID, "invalid_params", "run params are malformed: "+err.Error()))
		return
	}

	s.mu.Lock()
	if _, exists := s.runs[request.ID]; exists {
		s.mu.Unlock()
		s.write(protocol.Failure(
			request.ID,
			"duplicate_request_id",
			"A run with this request id is already active.",
		))
		return
	}

	root := s.rootCtx
	if root == nil {
		s.mu.Unlock()
		s.write(protocol.Failure(request.ID, "internal_error", "The judge server is not running."))
		return
	}

	ctx, cancel := context.WithCancel(root)
	s.runs[request.ID] = cancel
	s.runsWG.Add(1)
	s.mu.Unlock()

	go func() {
		defer s.runsWG.Done()
		defer func() {
			cancel()
			s.mu.Lock()
			delete(s.runs, request.ID)
			s.mu.Unlock()
		}()

		result, err := s.runner.RunWithEvents(ctx, runRequest, func(testResult judge.TestResult) {
			s.write(protocol.Event(request.ID, protocol.EventTestResult, testResult))
		})
		if err != nil {
			s.write(protocol.Failure(request.ID, errorCode(err), err.Error()))
			return
		}

		s.write(protocol.Success(request.ID, result))
	}()
}

func (s *Server) handleCancel(request protocol.Request) {
	var params protocol.CancelParams
	if len(request.Params) == 0 {
		s.write(protocol.Failure(request.ID, "invalid_params", "cancel requires params."))
		return
	}
	if err := json.Unmarshal(request.Params, &params); err != nil || params.TargetID == "" {
		s.write(protocol.Failure(request.ID, "invalid_params", "cancel requires params.targetId."))
		return
	}

	s.mu.Lock()
	cancel, active := s.runs[params.TargetID]
	s.mu.Unlock()

	if active {
		cancel()
	}

	s.write(protocol.Success(request.ID, protocol.CancelResult{
		Cancelled: active,
		TargetID:  params.TargetID,
	}))
}

// stopRuns cancels every in-flight run and waits briefly for the goroutines to
// write their final responses. A stuck runtime cannot hold shutdown forever.
func (s *Server) stopRuns() {
	s.mu.Lock()
	if s.rootCancel != nil {
		s.rootCancel()
	}
	for id, cancel := range s.runs {
		cancel()
		delete(s.runs, id)
	}
	s.mu.Unlock()

	done := make(chan struct{})
	go func() {
		s.runsWG.Wait()
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(shutdownGraceLimit):
	}
}

func (s *Server) write(response protocol.Response) {
	s.writeMu.Lock()
	defer s.writeMu.Unlock()

	if s.writeErr != nil {
		return
	}

	if s.encoder == nil {
		s.writeErr = errors.New("write response: server is not writing")
		return
	}

	if err := s.encoder.Encode(response); err != nil {
		s.writeErr = fmt.Errorf("write response: %w", err)
		if s.rootCancel != nil {
			s.rootCancel()
		}
	}
}

func (s *Server) writeError() error {
	s.writeMu.Lock()
	defer s.writeMu.Unlock()
	return s.writeErr
}

func errorCode(err error) string {
	switch {
	case errors.Is(err, judge.ErrInvalidRequest):
		return "invalid_request"
	case errors.Is(err, judge.ErrRuntimeMissing):
		return "runtime_missing"
	default:
		return "internal_error"
	}
}

func (s *Server) helloResult() protocol.HelloResult {
	return protocol.HelloResult{
		ProtocolVersion: s.info.ProtocolVersion,
		Name:            s.info.Name,
		Version:         s.info.Version,
		OS:              runtime.GOOS,
		Arch:            runtime.GOARCH,
		GoVersion:       runtime.Version(),
	}
}
