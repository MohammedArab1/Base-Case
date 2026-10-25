package judge

import (
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

// Runner owns language discovery and per-run workspace execution. Runtime
// bundling is a later decision; BASE_CASE_PYTHON and BASE_CASE_NODE can point
// at pinned runtimes when they are packaged with the app.
type Runner struct {
	PythonPath       string
	PythonSource     string
	NodePath         string
	NodeSource       string
	TempRoot         string
	OutputLimitBytes int
	Sandbox          bool
}

type RuntimeInfo struct {
	Name      string `json:"name"`
	Path      string `json:"path"`
	Source    string `json:"source,omitempty"`
	Version   string `json:"version"`
	Available bool   `json:"available"`
	Error     string `json:"error,omitempty"`
}

func NewRunner() *Runner {
	runtimeRoot := bundledRuntimeRoot()

	pythonPath := os.Getenv("BASE_CASE_PYTHON")
	pythonSource := "env"
	if pythonPath == "" {
		pythonPath = bundledPython(runtimeRoot)
		pythonSource = "bundled"
	}
	if pythonPath == "" {
		if runtime.GOOS == "windows" {
			// The Windows Store "python3" alias is often a stub that never runs
			// Python. Probe candidates and keep the first one that executes.
			pythonPath = firstWorkingRuntime("python", "python3")
		} else {
			pythonPath = firstWorkingRuntime("python3", "python")
		}
		pythonSource = "system"
	}

	nodePath := os.Getenv("BASE_CASE_NODE")
	nodeSource := "env"
	if nodePath == "" {
		nodePath = bundledNode(runtimeRoot)
		nodeSource = "bundled"
	}
	if nodePath == "" {
		nodePath = firstWorkingRuntime("node")
		nodeSource = "system"
	}

	return &Runner{
		PythonPath:       pythonPath,
		PythonSource:     pythonSource,
		NodePath:         nodePath,
		NodeSource:       nodeSource,
		TempRoot:         os.Getenv("BASE_CASE_JUDGE_TMP"),
		OutputLimitBytes: 1024 * 1024,
		Sandbox:          true,
	}
}

// bundledRuntimeRoot finds the runtime directory next to the judge binary. In
// the packaged app the judge lives in Resources/judge and the runtimes in
// Resources/runtimes; in development they are build/judge and build/runtime.
func bundledRuntimeRoot() string {
	if root := os.Getenv("BASE_CASE_RUNTIME_ROOT"); root != "" {
		return root
	}

	executable, err := os.Executable()
	if err != nil {
		return ""
	}

	directory := filepath.Dir(executable)
	candidates := []string{
		filepath.Join(directory, "runtimes"),
		filepath.Join(directory, "runtime"),
		filepath.Join(directory, "..", "runtimes"),
		filepath.Join(directory, "..", "runtime"),
	}

	for _, candidate := range candidates {
		if info, err := os.Stat(candidate); err == nil && info.IsDir() {
			return candidate
		}
	}

	return ""
}

func bundledPython(root string) string {
	if root == "" {
		return ""
	}

	return firstExistingFile(
		filepath.Join(root, "python", "bin", "python3"),
		filepath.Join(root, "python", "bin", "python"),
		filepath.Join(root, "python", "python.exe"),
	)
}

func bundledNode(root string) string {
	if root == "" {
		return ""
	}

	return firstExistingFile(
		filepath.Join(root, "node", "bin", "node"),
		filepath.Join(root, "node", "node.exe"),
	)
}

func firstExistingFile(paths ...string) string {
	for _, path := range paths {
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			return path
		}
	}

	return ""
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

// Doctor reports the resolved runtimes, including whether each came from an
// env override, a bundled pack, or the host system.
func (r *Runner) Doctor(ctx context.Context) map[string]RuntimeInfo {
	return map[string]RuntimeInfo{
		"python": r.runtimeInfo(ctx, "python", r.PythonPath, r.PythonSource, "--version"),
		"node":   r.runtimeInfo(ctx, "node", r.NodePath, r.NodeSource, "--version"),
	}
}

func (r *Runner) runtimeInfo(
	ctx context.Context,
	name string,
	path string,
	source string,
	args ...string,
) RuntimeInfo {
	info := RuntimeInfo{Name: name, Path: path, Source: source}

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
