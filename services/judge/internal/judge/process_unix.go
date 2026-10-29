//go:build !windows

package judge

import (
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
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

// processGuard is a no-op on POSIX: configureProcess already puts the child in
// its own process group, and killProcessGroup kills the whole group.
type processGuard struct{}

func guardProcess(pid int, limits processLimits) processGuard {
	return processGuard{}
}

func (g processGuard) release() {}

func (g processGuard) terminate(pid int) {
	killProcessGroup(pid)
}

// peak reports the kernel's high-water mark for the child. On macOS Maxrss is
// already in bytes; on Linux and most BSDs it is in kilobytes.
func (g processGuard) peak(state *os.ProcessState) int64 {
	if state == nil {
		return 0
	}

	usage, ok := state.SysUsage().(*syscall.Rusage)
	if !ok || usage == nil {
		return 0
	}

	peak := int64(usage.Maxrss)
	if runtime.GOOS != "darwin" {
		peak *= 1024
	}
	return peak
}

// processTreeStats samples the resident set size and process count of the
// runtime's process group. configureProcess puts the runtime in its own group,
// so group membership covers the process tree on macOS without parsing parent
// links.
func processTreeStats(rootPID int) (int64, int) {
	if rootPID <= 0 {
		return 0, 0
	}

	if runtime.GOOS == "darwin" {
		return processGroupStats(rootPID)
	}

	return processTreeStatsFromPS(rootPID)
}

func processGroupStats(pid int) (int64, int) {
	output, err := exec.Command("ps", "-o", "rss=", "-g", strconv.Itoa(pid)).Output()
	if err != nil {
		return 0, 0
	}

	var kilobytes int64
	count := 0
	for _, line := range strings.Split(string(output), "\n") {
		fields := strings.Fields(line)
		if len(fields) == 0 {
			continue
		}
		rss, err := strconv.ParseInt(fields[0], 10, 64)
		if err == nil {
			kilobytes += rss
			count++
		}
	}

	return kilobytes * 1024, count
}

// processTreeMemoryFromPS is the portable fallback used on Linux and other
// Unix systems where ps does not select by process group consistently.
func processTreeStatsFromPS(rootPID int) (int64, int) {
	output, err := exec.Command("ps", "-o", "pid=,ppid=,rss=", "-ax").Output()
	if err != nil {
		return 0, 0
	}

	children := make(map[int][]int)
	rssByPID := make(map[int]int64)

	for _, line := range strings.Split(string(output), "\n") {
		fields := strings.Fields(line)
		if len(fields) != 3 {
			continue
		}

		pid, pidErr := strconv.Atoi(fields[0])
		parent, parentErr := strconv.Atoi(fields[1])
		rss, rssErr := strconv.ParseInt(fields[2], 10, 64)
		if pidErr != nil || parentErr != nil || rssErr != nil {
			continue
		}

		children[parent] = append(children[parent], pid)
		rssByPID[pid] = rss
	}

	var kilobytes int64
	count := 0
	queue := []int{rootPID}
	seen := make(map[int]bool)

	for len(queue) > 0 {
		pid := queue[0]
		queue = queue[1:]

		if seen[pid] {
			continue
		}
		seen[pid] = true

		kilobytes += rssByPID[pid]
		count++
		queue = append(queue, children[pid]...)
	}

	return kilobytes * 1024, count
}
