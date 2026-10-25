//go:build darwin

package judge

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

const seatbeltExecutable = "/usr/bin/sandbox-exec"

// sandboxCommand wraps a runtime invocation in a Seatbelt profile. The profile
// denies network and home-directory access, allows reads of system/runtime
// libraries, and limits writes to the per-run workspace and temp directories.
func sandboxCommand(command *exec.Cmd, workspace, runtimePath string) *exec.Cmd {
	if _, err := os.Stat(seatbeltExecutable); err != nil {
		fmt.Fprintf(os.Stderr, "judge: Seatbelt unavailable, running without a sandbox: %v\n", err)
		return command
	}

	profile := seatbeltProfile(workspace, runtimePath)
	args := make([]string, 0, len(command.Args)+2)
	args = append(args, "-p", profile, command.Path)
	args = append(args, command.Args[1:]...)

	wrapped := exec.Command(seatbeltExecutable, args...)
	wrapped.Dir = command.Dir
	wrapped.Env = command.Env
	wrapped.Stdin = command.Stdin
	wrapped.Stdout = command.Stdout
	wrapped.Stderr = command.Stderr

	return wrapped
}

func seatbeltProfile(workspace, runtimePath string) string {
	execRoot := runtimeRoot(runtimePath)

	readPaths := []string{
		workspace,
		execRoot,
		"/System",
		"/usr",
		"/bin",
		"/sbin",
		"/Library",
		"/private/etc",
		"/private/var",
		"/dev",
		"/opt/homebrew",
		"/usr/local",
	}

	var builder strings.Builder
	builder.WriteString("(version 1)\n")
	builder.WriteString("(deny default)\n")
	builder.WriteString("(allow process-fork)\n")
	builder.WriteString("(allow file-read-metadata)\n")
	builder.WriteString("(allow sysctl-read)\n")
	builder.WriteString("(allow mach-lookup)\n")
	builder.WriteString("(allow ipc-posix-shm)\n")

	fmt.Fprintf(&builder, "(allow process-exec (subpath %q))\n", execRoot)

	builder.WriteString("(allow file-read* (literal \"/\")")
	for _, path := range readPaths {
		fmt.Fprintf(&builder, " (subpath %q)", path)
	}
	builder.WriteString(")\n")

	builder.WriteString("(allow file-write*")
	for _, path := range []string{workspace, "/private/var/folders", "/private/tmp"} {
		fmt.Fprintf(&builder, " (subpath %q)", path)
	}
	for _, path := range []string{
		"/dev/null",
		"/dev/stdout",
		"/dev/stderr",
		"/dev/dtracehelper",
	} {
		fmt.Fprintf(&builder, " (literal %q)", path)
	}
	builder.WriteString(")\n")

	builder.WriteString("(deny network*)\n")

	return builder.String()
}

// runtimeRoot returns the narrowest directory that contains the runtime and
// its launcher helpers. Resolving symlinks is important: Homebrew's python3
// execs Python.app from its versioned Cellar directory, not from bin/.
func runtimeRoot(runtimePath string) string {
	root := filepath.Dir(runtimePath)
	if filepath.Base(root) == "bin" {
		root = filepath.Dir(root)
	}

	if resolved, err := filepath.EvalSymlinks(runtimePath); err == nil {
		resolvedRoot := filepath.Dir(resolved)
		if filepath.Base(resolvedRoot) == "bin" {
			resolvedRoot = filepath.Dir(resolvedRoot)
		}
		root = resolvedRoot
	}

	return root
}
