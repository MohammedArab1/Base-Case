package judge

import (
	"context"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

// Runner owns language discovery and per-run workspace execution. Runtime
// bundling is a later decision; BASE_CASE_PYTHON and BASE_CASE_NODE can point
// at pinned runtimes when they are packaged with the app.
type Runner struct {
	PythonPath       string
	NodePath         string
	TempRoot         string
	OutputLimitBytes int
	Sandbox          bool
}

type RuntimeInfo struct {
	Name      string `json:"name"`
	Path      string `json:"path"`
	Version   string `json:"version"`
	Available bool   `json:"available"`
	Error     string `json:"error,omitempty"`
}

func NewRunner() *Runner {
	pythonPath := os.Getenv("BASE_CASE_PYTHON")
	if pythonPath == "" {
		if runtime.GOOS == "windows" {
			// The Windows Store "python3" alias is often a stub that never runs
			// Python. Probe candidates and keep the first one that executes.
			pythonPath = firstWorkingRuntime("python", "python3")
		} else {
			pythonPath = firstWorkingRuntime("python3", "python")
		}
	}

	nodePath := os.Getenv("BASE_CASE_NODE")
	if nodePath == "" {
		nodePath = firstWorkingRuntime("node")
	}

	return &Runner{
		PythonPath:       pythonPath,
		NodePath:         nodePath,
		TempRoot:         os.Getenv("BASE_CASE_JUDGE_TMP"),
		OutputLimitBytes: 1024 * 1024,
		Sandbox:          true,
	}
}

// firstWorkingRuntime returns the first candidate that both resolves on PATH
// and runs. If none run, it returns the first resolved path so Doctor can show
// why the runtime is unusable instead of reporting it as missing.
func firstWorkingRuntime(names ...string) string {
	fallback := ""

	for _, name := range names {
		path, err := exec.LookPath(name)
		if err != nil {
			continue
		}

		if fallback == "" {
			fallback = path
		}

		if runtimeRuns(path) {
			return path
		}
	}

	return fallback
}

func runtimeRuns(path string) bool {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	return exec.CommandContext(ctx, path, "--version").Run() == nil
}

func (r *Runner) runtimeFor(language string) (string, error) {
	switch language {
	case "python":
		if r.PythonPath == "" {
			return "", ErrRuntimeMissing
		}
		return r.PythonPath, nil
	case "typescript", "javascript":
		if r.NodePath == "" {
			return "", ErrRuntimeMissing
		}
		return r.NodePath, nil
	default:
		return "", ErrInvalidRequest
	}
}

func (r *Runner) outputLimit() int {
	if r.OutputLimitBytes <= 0 {
		return 1024 * 1024
	}
	return r.OutputLimitBytes
}

// Doctor reports the resolved runtimes. It is intentionally independent of
// any bundled runtime manifest; Phase 3 replaces this with checksummed runtime
// packs.
func (r *Runner) Doctor(ctx context.Context) map[string]RuntimeInfo {
	return map[string]RuntimeInfo{
		"python": r.runtimeInfo(ctx, "python", r.PythonPath, "--version"),
		"node":   r.runtimeInfo(ctx, "node", r.NodePath, "--version"),
	}
}

func (r *Runner) runtimeInfo(ctx context.Context, name, path string, args ...string) RuntimeInfo {
	info := RuntimeInfo{Name: name, Path: path}

	if path == "" {
		info.Error = "not found"
		return info
	}

	versionCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	output, err := exec.CommandContext(versionCtx, path, args...).CombinedOutput()
	if err != nil {
		info.Error = err.Error()
		return info
	}

	info.Available = true
	info.Version = strings.TrimSpace(string(output))
	return info
}
