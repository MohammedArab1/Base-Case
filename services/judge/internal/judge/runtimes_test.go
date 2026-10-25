package judge

import (
	"context"
	"os"
	"path/filepath"
	"runtime"
	"testing"
)

func TestRuntimeInfoUnavailableWhenProbeFails(t *testing.T) {
	runner := &Runner{}
	missing := filepath.Join(t.TempDir(), "missing-runtime")

	info := runner.runtimeInfo(context.Background(), "python", missing, "system", "--version")

	if info.Available {
		t.Fatal("expected an unavailable runtime when the probe fails")
	}
	if info.Error == "" {
		t.Fatal("expected the probe error to be reported")
	}
}

func TestRuntimeInfoUnavailableWhenPathIsEmpty(t *testing.T) {
	runner := &Runner{}

	info := runner.runtimeInfo(context.Background(), "node", "", "system", "--version")

	if info.Available {
		t.Fatal("expected an unavailable runtime when no path was resolved")
	}
	if info.Error != "not found" {
		t.Fatalf("expected not found, got %q", info.Error)
	}
}

func TestBundledRuntimePaths(t *testing.T) {
	root := t.TempDir()

	pythonBinary := filepath.Join(root, "python", "python.exe")
	nodeBinary := filepath.Join(root, "node", "node.exe")
	if runtime.GOOS != "windows" {
		pythonBinary = filepath.Join(root, "python", "bin", "python3")
		nodeBinary = filepath.Join(root, "node", "bin", "node")
	}

	for _, path := range []string{pythonBinary, nodeBinary} {
		if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
			t.Fatalf("mkdir: %v", err)
		}
		if err := os.WriteFile(path, []byte(""), 0o755); err != nil {
			t.Fatalf("write: %v", err)
		}
	}

	if got := bundledPython(root); got != pythonBinary {
		t.Fatalf("expected %s, got %s", pythonBinary, got)
	}
	if got := bundledNode(root); got != nodeBinary {
		t.Fatalf("expected %s, got %s", nodeBinary, got)
	}
}

func TestNewRunnerPrefersBundledRuntimes(t *testing.T) {
	root := t.TempDir()

	pythonBinary := filepath.Join(root, "python", "python.exe")
	nodeBinary := filepath.Join(root, "node", "node.exe")
	if runtime.GOOS != "windows" {
		pythonBinary = filepath.Join(root, "python", "bin", "python3")
		nodeBinary = filepath.Join(root, "node", "bin", "node")
	}

	for _, path := range []string{pythonBinary, nodeBinary} {
		if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
			t.Fatalf("mkdir: %v", err)
		}
		if err := os.WriteFile(path, []byte(""), 0o755); err != nil {
			t.Fatalf("write: %v", err)
		}
	}

	t.Setenv("BASE_CASE_RUNTIME_ROOT", root)
	t.Setenv("BASE_CASE_PYTHON", "")
	t.Setenv("BASE_CASE_NODE", "")

	runner := NewRunner()

	if runner.PythonPath != pythonBinary || runner.PythonSource != "bundled" {
		t.Fatalf("unexpected python runtime: %s (%s)", runner.PythonPath, runner.PythonSource)
	}
	if runner.NodePath != nodeBinary || runner.NodeSource != "bundled" {
		t.Fatalf("unexpected node runtime: %s (%s)", runner.NodePath, runner.NodeSource)
	}
}
