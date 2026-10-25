//go:build windows

package judge

import (
	"os"
	"os/exec"
	"strconv"
	"syscall"
	"unsafe"

	"golang.org/x/sys/windows"
)

var (
	modpsapi                 = windows.NewLazySystemDLL("psapi.dll")
	procGetProcessMemoryInfo = modpsapi.NewProc("GetProcessMemoryInfo")
)

type processMemoryCounters struct {
	Size                       uint32
	PageFaultCount             uint32
	PeakWorkingSetSize         uintptr
	WorkingSetSize             uintptr
	QuotaPeakPagedPoolUsage    uintptr
	QuotaPagedPoolUsage        uintptr
	QuotaPeakNonPagedPoolUsage uintptr
	QuotaNonPagedPoolUsage     uintptr
	PagefileUsage              uintptr
	PeakPagefileUsage          uintptr
}

func configureProcess(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{CreationFlags: syscall.CREATE_NEW_PROCESS_GROUP}
}

// processGuard owns the Job Object that contains the runtime process tree.
type processGuard struct {
	job windows.Handle
}

// guardProcess places the child in a Job Object configured to kill the whole
// process tree when the job handle closes. Windows closes the handle when the
// judge exits for any reason, including being killed, so a runtime child cannot
// outlive the sidecar.
func guardProcess(pid int, limits processLimits) processGuard {
	if pid <= 0 {
		return processGuard{}
	}

	job, err := windows.CreateJobObject(nil, nil)
	if err != nil {
		return processGuard{}
	}

	info := windows.JOBOBJECT_EXTENDED_LIMIT_INFORMATION{}
	flags := uint32(windows.JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE)

	if limits.MemoryBytes > 0 {
		// Keep headroom above the sampler threshold so a fast allocation that
		// trips the job limit still has a peak above the reported limit.
		flags |= windows.JOB_OBJECT_LIMIT_JOB_MEMORY
		info.JobMemoryLimit = uintptr(limits.MemoryBytes + limits.MemoryBytes/4)
	}
	if limits.CPUTime > 0 {
		flags |= windows.JOB_OBJECT_LIMIT_JOB_TIME
		info.BasicLimitInformation.PerJobUserTimeLimit = limits.CPUTime.Nanoseconds() / 100
	}
	if limits.MaxProcesses > 0 {
		flags |= windows.JOB_OBJECT_LIMIT_ACTIVE_PROCESS
		info.BasicLimitInformation.ActiveProcessLimit = limits.MaxProcesses
	}

	info.BasicLimitInformation.LimitFlags = flags

	if _, err := windows.SetInformationJobObject(
		job,
		windows.JobObjectExtendedLimitInformation,
		uintptr(unsafe.Pointer(&info)),
		uint32(unsafe.Sizeof(info)),
	); err != nil {
		_ = windows.CloseHandle(job)
		return processGuard{}
	}

	process, err := windows.OpenProcess(
		windows.PROCESS_SET_QUOTA|windows.PROCESS_TERMINATE,
		false,
		uint32(pid),
	)
	if err != nil {
		_ = windows.CloseHandle(job)
		return processGuard{}
	}
	defer windows.CloseHandle(process)

	if err := windows.AssignProcessToJobObject(job, process); err != nil {
		_ = windows.CloseHandle(job)
		return processGuard{}
	}

	return processGuard{job: job}
}

func (g processGuard) release() {
	if g.job != 0 {
		_ = windows.CloseHandle(g.job)
	}
}

// peak reports the job's peak committed memory. The job handle stays open until
// release, so this remains valid after the child exits.
func (g processGuard) peak(*os.ProcessState) int64 {
	if g.job == 0 {
		return 0
	}

	info := windows.JOBOBJECT_EXTENDED_LIMIT_INFORMATION{}
	var returned uint32

	if err := windows.QueryInformationJobObject(
		g.job,
		windows.JobObjectExtendedLimitInformation,
		uintptr(unsafe.Pointer(&info)),
		uint32(unsafe.Sizeof(info)),
		&returned,
	); err != nil {
		return 0
	}

	return int64(info.PeakJobMemoryUsed)
}

// processTreeStats sums the working sets of the runtime and its descendants
// and counts the processes in the tree.
func processTreeStats(rootPID int) (int64, int) {
	if rootPID <= 0 {
		return 0, 0
	}

	snapshot, err := windows.CreateToolhelp32Snapshot(windows.TH32CS_SNAPPROCESS, 0)
	if err != nil {
		return 0, 0
	}
	defer windows.CloseHandle(snapshot)

	children := make(map[uint32][]uint32)
	entry := windows.ProcessEntry32{Size: uint32(unsafe.Sizeof(windows.ProcessEntry32{}))}

	if err := windows.Process32First(snapshot, &entry); err != nil {
		return 0, 0
	}

	for {
		children[entry.ParentProcessID] = append(children[entry.ParentProcessID], entry.ProcessID)

		if err := windows.Process32Next(snapshot, &entry); err != nil {
			break
		}
	}

	var total int64
	count := 0
	queue := []uint32{uint32(rootPID)}
	seen := make(map[uint32]bool)

	for len(queue) > 0 {
		pid := queue[0]
		queue = queue[1:]

		if seen[pid] {
			continue
		}
		seen[pid] = true

		total += processWorkingSet(pid)
		count++
		queue = append(queue, children[pid]...)
	}

	return total, count
}

func processWorkingSet(pid uint32) int64 {
	handle, err := windows.OpenProcess(
		windows.PROCESS_QUERY_INFORMATION|windows.PROCESS_VM_READ,
		false,
		pid,
	)
	if err != nil {
		return 0
	}
	defer windows.CloseHandle(handle)

	if err := procGetProcessMemoryInfo.Find(); err != nil {
		return 0
	}

	counters := processMemoryCounters{Size: uint32(unsafe.Sizeof(processMemoryCounters{}))}
	result, _, _ := procGetProcessMemoryInfo.Call(
		uintptr(handle),
		uintptr(unsafe.Pointer(&counters)),
		uintptr(counters.Size),
	)
	if result == 0 {
		return 0
	}

	return int64(counters.WorkingSetSize)
}

func killProcessGroup(pid int) {
	if pid <= 0 {
		return
	}
	_ = exec.Command("taskkill", "/T", "/F", "/PID", strconv.Itoa(pid)).Run()
}
