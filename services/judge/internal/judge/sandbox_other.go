//go:build !darwin

package judge

import "os/exec"

// sandboxCommand is a no-op outside macOS. Windows uses Job Objects in
// process_windows.go; Linux is not a supported target.
func sandboxCommand(command *exec.Cmd, workspace, runtimePath string) *exec.Cmd {
	return command
}
