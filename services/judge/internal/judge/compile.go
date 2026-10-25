package judge

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/evanw/esbuild/pkg/api"
)

const compileTimeout = 10 * time.Second

// compileWorkspace validates user code once per run. TypeScript is transpiled
// to plain ESM so each test executes JavaScript directly instead of asking Node
// to strip types again. Python and JavaScript get a syntax-only check.
func compileWorkspace(
	ctx context.Context,
	workspace string,
	language string,
	runtimePath string,
) CompileResult {
	started := time.Now()

	switch language {
	case "python":
		return compilePython(ctx, workspace, runtimePath, started)
	case "typescript":
		return compileTypeScript(workspace, started)
	case "javascript":
		return checkJavaScript(ctx, workspace, runtimePath, started)
	default:
		return CompileResult{
			OK:         false,
			Stderr:     fmt.Sprintf("Unsupported language %q.", language),
			DurationMs: time.Since(started).Milliseconds(),
		}
	}
}

func compilePython(
	ctx context.Context,
	workspace string,
	runtimePath string,
	started time.Time,
) CompileResult {
	compileContext, cancel := context.WithTimeout(ctx, compileTimeout)
	defer cancel()

	command := exec.CommandContext(compileContext, runtimePath, "-I", "-m", "py_compile", "solution.py")
	command.Dir = workspace
	command.Env = sanitizedEnv(workspace, filepath.Dir(runtimePath))

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	command.Stdout = &stdout
	command.Stderr = &stderr

	err := command.Run()
	result := CompileResult{
		OK:         err == nil,
		Stdout:     stdout.String(),
		Stderr:     stderr.String(),
		DurationMs: time.Since(started).Milliseconds(),
	}

	if compileContext.Err() == context.DeadlineExceeded {
		result.OK = false
		result.Stderr = "Compilation exceeded its time limit."
	}

	return result
}

func compileTypeScript(workspace string, started time.Time) CompileResult {
	source, err := os.ReadFile(filepath.Join(workspace, "solution.ts"))
	if err != nil {
		return CompileResult{
			OK:         false,
			Stderr:     fmt.Sprintf("Read solution: %v", err),
			DurationMs: time.Since(started).Milliseconds(),
		}
	}

	transformed := api.Transform(string(source), api.TransformOptions{
		Loader:     api.LoaderTS,
		Format:     api.FormatESModule,
		Target:     api.ES2020,
		Sourcefile: "solution.ts",
		Sourcemap:  api.SourceMapInline,
	})

	result := CompileResult{
		OK:         len(transformed.Errors) == 0,
		Stdout:     formatEsbuildMessages(transformed.Warnings),
		Stderr:     formatEsbuildMessages(transformed.Errors),
		DurationMs: time.Since(started).Milliseconds(),
	}

	if !result.OK {
		return result
	}

	if err := os.WriteFile(filepath.Join(workspace, "solution.mjs"), transformed.Code, 0o600); err != nil {
		result.OK = false
		result.Stderr = fmt.Sprintf("Write compiled solution: %v", err)
	}

	return result
}

func checkJavaScript(
	ctx context.Context,
	workspace string,
	runtimePath string,
	started time.Time,
) CompileResult {
	compileContext, cancel := context.WithTimeout(ctx, compileTimeout)
	defer cancel()

	command := exec.CommandContext(compileContext, runtimePath, "--check", "solution.mjs")
	command.Dir = workspace
	command.Env = sanitizedEnv(workspace, filepath.Dir(runtimePath))

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	command.Stdout = &stdout
	command.Stderr = &stderr

	err := command.Run()
	result := CompileResult{
		OK:         err == nil,
		Stdout:     stdout.String(),
		Stderr:     stderr.String(),
		DurationMs: time.Since(started).Milliseconds(),
	}

	if compileContext.Err() == context.DeadlineExceeded {
		result.OK = false
		result.Stderr = "Compilation exceeded its time limit."
	}

	return result
}

func formatEsbuildMessages(messages []api.Message) string {
	var builder strings.Builder

	for _, message := range messages {
		if message.Location != nil {
			fmt.Fprintf(
				&builder,
				"%s:%d:%d: ",
				message.Location.File,
				message.Location.Line,
				message.Location.Column,
			)
		}
		builder.WriteString(message.Text)
		builder.WriteString("\n")

		for _, note := range message.Notes {
			fmt.Fprintf(&builder, "  note: %s\n", note.Text)
		}
	}

	return builder.String()
}
