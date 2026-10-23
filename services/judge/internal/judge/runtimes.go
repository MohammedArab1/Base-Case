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
			// The Windows Store "python3" alias can be a stub that never runs
			// Python. Prefer the real "python" command used by setup-python.
			pythonPath = firstLookPath("python", "python3")
		} else {
			pythonPath = firstLookPath("python3", "python")
		}
	}

	nodePath := os.Getenv("BASE_CASE_NODE")
	if nodePath == "" {
		nodePath = firstLookPath("node")
	}

	return &Runner{
		PythonPath:       pythonPath,
		NodePath:         nodePath,
		TempRoot:         os.Getenv("BASE_CASE_JUDGE_TMP"),
		OutputLimitBytes: 1024 * 1024,
	}
}

func firstLookPath(names ...string) string {
	for _, name := range names {
		if path, err := exec.LookPath(name); err == nil {
			return path
		}
	}
	return ""
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

	info.Available = true
	versionCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	output, err := exec.CommandContext(versionCtx, path, args...).CombinedOutput()
	if err != nil {
		info.Error = err.Error()
		return info
	}

	info.Version = strings.TrimSpace(string(output))
	return info
}
