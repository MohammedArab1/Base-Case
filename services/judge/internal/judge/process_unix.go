//go:build !windows

package judge

import (
	"os/exec"
	"syscall"
)

func configureProcess(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
}

func killProcessGroup(pid int) {
	if pid <= 0 {
		return
	}
	_ = syscall.Kill(-pid, syscall.SIGKILL)
}

// guardProcess is a no-op on POSIX: configureProcess already puts the child in
// its own process group, and killProcessGroup kills the whole group.
func guardProcess(pid int) func() {
	return func() {}
}
