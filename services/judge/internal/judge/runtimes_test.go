package judge

import (
	"context"
	"path/filepath"
	"testing"
)

func TestRuntimeInfoUnavailableWhenProbeFails(t *testing.T) {
	runner := &Runner{}
	missing := filepath.Join(t.TempDir(), "missing-runtime")

	info := runner.runtimeInfo(context.Background(), "python", missing, "--version")

	if info.Available {
		t.Fatal("expected an unavailable runtime when the probe fails")
	}
	if info.Error == "" {
		t.Fatal("expected the probe error to be reported")
	}
}

func TestRuntimeInfoUnavailableWhenPathIsEmpty(t *testing.T) {
	runner := &Runner{}

	info := runner.runtimeInfo(context.Background(), "node", "", "--version")

	if info.Available {
		t.Fatal("expected an unavailable runtime when no path was resolved")
	}
	if info.Error != "not found" {
		t.Fatalf("expected not found, got %q", info.Error)
	}
}
