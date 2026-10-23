package protocol

import (
	"encoding/json"
	"testing"
)

func TestSuccessResponseRoundTrip(t *testing.T) {
	response := Success("req-1", map[string]any{"pong": true})

	data, err := json.Marshal(response)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}

	var decoded Response
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}

	if decoded.ID != "req-1" || !decoded.OK {
		t.Fatalf("unexpected response: %+v", decoded)
	}
	if decoded.Error != nil {
		t.Fatalf("expected no error, got %+v", decoded.Error)
	}
}

func TestFailureResponseRoundTrip(t *testing.T) {
	response := Failure("req-2", "unknown_method", "Unknown method.")

	data, err := json.Marshal(response)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}

	var decoded Response
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}

	if decoded.OK {
		t.Fatal("expected failure response")
	}
	if decoded.Error == nil || decoded.Error.Code != "unknown_method" {
		t.Fatalf("unexpected error: %+v", decoded.Error)
	}
}

func TestRequestParamsArePreserved(t *testing.T) {
	var request Request
	if err := json.Unmarshal([]byte(`{"id":"1","method":"run","params":{"language":"python"}}`), &request); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}

	if request.ID != "1" || request.Method != "run" {
		t.Fatalf("unexpected request: %+v", request)
	}
	if string(request.Params) != `{"language":"python"}` {
		t.Fatalf("unexpected params: %s", request.Params)
	}
}
