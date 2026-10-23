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

	"github.com/base-case/base-case/services/judge/internal/judge"
	"github.com/base-case/base-case/services/judge/internal/protocol"
)

const maxRequestBytes = 1024 * 1024

// Info identifies the judge process in hello/version responses.
type Info struct {
	Name            string
	Version         string
	ProtocolVersion int
}

// Server handles newline-delimited JSON requests. Execution is delegated to a
// Runner; content loading and persistence stay in the host application.
type Server struct {
	info   Info
	runner *judge.Runner
}

func New(info Info) *Server {
	return &Server{
		info:   info,
		runner: judge.NewRunner(),
	}
}

// Serve reads requests from input and writes responses to output. It returns
// nil when a shutdown request is handled or the input reaches EOF.
func (s *Server) Serve(input io.Reader, output io.Writer) error {
	scanner := bufio.NewScanner(input)
	scanner.Buffer(make([]byte, 64*1024), maxRequestBytes)
	encoder := json.NewEncoder(output)

	for scanner.Scan() {
		line := bytes.TrimSpace(scanner.Bytes())
		if len(line) == 0 {
			continue
		}

		response, stop := s.handle(line)
		if err := encoder.Encode(response); err != nil {
			return fmt.Errorf("write response: %w", err)
		}
		if stop {
			return nil
		}
	}

	return scanner.Err()
}

func (s *Server) handle(line []byte) (protocol.Response, bool) {
	var request protocol.Request
	if err := json.Unmarshal(line, &request); err != nil {
		return protocol.Failure("", "invalid_json", "Request must be a JSON object."), false
	}

	if request.Method == "" {
		return protocol.Failure(request.ID, "invalid_request", "Request is missing a method."), false
	}

	switch request.Method {
	case protocol.MethodHello, protocol.MethodVersion:
		return protocol.Success(request.ID, s.helloResult()), false
	case protocol.MethodPing:
		return protocol.Success(request.ID, map[string]any{"pong": true}), false
	case protocol.MethodDoctor:
		return protocol.Success(request.ID, s.runner.Doctor(context.Background())), false
	case protocol.MethodRun:
		return s.handleRun(request), false
	case protocol.MethodShutdown:
		return protocol.Success(request.ID, map[string]any{"stopping": true}), true
	default:
		return protocol.Failure(
			request.ID,
			"unknown_method",
			fmt.Sprintf("Unknown method %q.", request.Method),
		), false
	}
}

func (s *Server) handleRun(request protocol.Request) protocol.Response {
	if len(request.Params) == 0 {
		return protocol.Failure(request.ID, "invalid_params", "run requires params.")
	}

	var runRequest judge.RunRequest
	if err := json.Unmarshal(request.Params, &runRequest); err != nil {
		return protocol.Failure(request.ID, "invalid_params", "run params are malformed: "+err.Error())
	}

	result, err := s.runner.Run(context.Background(), runRequest)
	if err != nil {
		code := "internal_error"
		switch {
		case errors.Is(err, judge.ErrInvalidRequest):
			code = "invalid_request"
		case errors.Is(err, judge.ErrRuntimeMissing):
			code = "runtime_missing"
		}
		return protocol.Failure(request.ID, code, err.Error())
	}

	return protocol.Success(request.ID, result)
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
