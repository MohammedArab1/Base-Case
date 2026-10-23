package server_test

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"strings"
	"testing"

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
