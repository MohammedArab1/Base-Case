//go:build !windows

package judge

import (
	"os"
	"path/filepath"
	"strconv"
	"testing"
)

func writeRuntimeScript(t *testing.T, directory, name string, exitCode int) {
	t.Helper()

	path := filepath.Join(directory, name)
	script := "#!/bin/sh\nexit " + strconv.Itoa(exitCode) + "\n"
	if err := os.WriteFile(path, []byte(script), 0o755); err != nil {
		t.Fatalf("write %s: %v", name, err)
	}
}

func TestFirstWorkingRuntimeSkipsBrokenCandidate(t *testing.T) {
	directory := t.TempDir()
	writeRuntimeScript(t, directory, "python", 1)
	writeRuntimeScript(t, directory, "python3", 0)
	t.Setenv("PATH", directory)

	got := firstWorkingRuntime("python", "python3")
	want := filepath.Join(directory, "python3")

	if got != want {
		t.Fatalf("expected %q, got %q", want, got)
	}
}

func TestFirstWorkingRuntimeFallsBackToResolvedPath(t *testing.T) {
	directory := t.TempDir()
	writeRuntimeScript(t, directory, "python", 1)
	writeRuntimeScript(t, directory, "python3", 1)
	t.Setenv("PATH", directory)

	got := firstWorkingRuntime("python", "python3")
	want := filepath.Join(directory, "python")

	if got != want {
		t.Fatalf("expected fallback %q, got %q", want, got)
	}
}
