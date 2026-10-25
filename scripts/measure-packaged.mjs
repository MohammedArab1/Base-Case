import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const desktopVersion = JSON.parse(
  readFileSync(join(root, 'apps/desktop/package.json'), 'utf8'),
).version
const defaultAppBinary =
  process.platform === 'win32'
    ? join(root, 'apps/desktop/dist/win-unpacked/Base Case.exe')
    : join(root, 'apps/desktop/dist/mac-arm64/Base Case.app/Contents/MacOS/Base Case')
const appBinary = process.env.BASE_CASE_APP_BINARY ?? defaultAppBinary
const appBundle = dirname(dirname(appBinary))
const port = 9900 + Math.floor(Math.random() * 400)
const userDataDirectory = mkdtempSync(join(tmpdir(), 'base-case-measure-'))
const logs = []
let child = null
let cdp = null

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function stopApp() {
  if (!child) {
    return
  }

  try {
    if (process.platform === 'win32') {
      execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    } else {
      process.kill(-child.pid, 'SIGTERM')
    }
  } catch {
    // Already gone.
  }

  child = null
}

async function waitForTarget() {
  const deadline = Date.now() + 30_000

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`)
      if (response.ok) {
        const targets = await response.json()
        const page = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl)
        if (page) {
          return page
        }
      }
    } catch {
      // Still starting.
    }
    await sleep(200)
  }

  throw new Error('Timed out waiting for the packaged app debug target')
}

function connect(webSocketUrl) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl)
    const pending = new Map()
    let nextId = 0

    socket.addEventListener('open', () => {
      resolve({
        send(method, params = {}) {
          return new Promise((resolveRequest, rejectRequest) => {
            const id = ++nextId
            pending.set(id, { resolve: resolveRequest, reject: rejectRequest })
            socket.send(JSON.stringify({ id, method, params }))
          })
        },
        close() {
          socket.close()
        },
      })
    })

    socket.addEventListener('error', () => reject(new Error('CDP connection failed')))
    socket.addEventListener('close', () => {
      for (const request of pending.values()) {
        request.reject(new Error('CDP connection closed'))
      }
      pending.clear()
    })
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data))
      if (!message.id) {
        return
      }
      const request = pending.get(message.id)
      if (!request) {
        return
      }
      pending.delete(message.id)
      if (message.error) {
        request.reject(new Error(message.error.message))
      } else {
        request.resolve(message.result)
      }
    })
  })
}

async function evaluate(expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  })

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text)
  }

  return result.result.value
}

async function waitForValue(expression, predicate, label, timeout = 30_000) {
  const deadline = Date.now() + timeout
  let lastValue

  while (Date.now() < deadline) {
    lastValue = await evaluate(expression)
    if (predicate(lastValue)) {
      return lastValue
    }
    await sleep(50)
  }

  throw new Error(`Timed out waiting for ${label}: ${JSON.stringify(lastValue)}`)
}

async function clickButtonWithText(text) {
  return evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((item) =>
      item.textContent?.includes(${JSON.stringify(text)}),
    )
    if (!button) {
      return false
    }
    button.click()
    return true
  })()`)
}

function directorySizeMb(path) {
  if (!existsSync(path)) {
    return null
  }
  const output = execFileSync('du', ['-sk', path], { encoding: 'utf8' })
  const kilobytes = Number(output.split(/\s+/)[0])
  return Math.round((kilobytes / 1024) * 10) / 10
}

function fileSizeMb(path) {
  if (!existsSync(path)) {
    return null
  }
  return Math.round((statSync(path).size / (1024 * 1024)) * 10) / 10
}

function processTreeMemory(pid) {
  if (process.platform === 'win32') {
    return { totalMb: null, processes: null }
  }

  const output = execFileSync('ps', ['-axo', 'pid=,ppid=,rss=,comm='], { encoding: 'utf8' })
  const rows = output
    .trim()
    .split('\n')
    .map((line) => line.trim().split(/\s+/))
    .filter((row) => row.length >= 3)
    .map((row) => ({
      pid: Number(row[0]),
      ppid: Number(row[1]),
      rssKb: Number(row[2]),
      command: row.slice(3).join(' '),
    }))

  const byParent = new Map()
  for (const row of rows) {
    const siblings = byParent.get(row.ppid) ?? []
    siblings.push(row)
    byParent.set(row.ppid, siblings)
  }

  const descendants = []
  const queue = [pid]
  while (queue.length > 0) {
    const current = queue.shift()
    for (const childRow of byParent.get(current) ?? []) {
      descendants.push(childRow)
      queue.push(childRow.pid)
    }
  }

  const totalKb = descendants.reduce((sum, row) => sum + row.rssKb, 0)
  const main = rows.find((row) => row.pid === pid)

  return {
    totalMb: Math.round((totalKb / 1024) * 10) / 10,
    mainMb: main ? Math.round((main.rssKb / 1024) * 10) / 10 : null,
    processes: descendants.length,
  }
}

async function main() {
  if (!existsSync(appBinary)) {
    throw new Error(`Packaged app not found: ${appBinary}`)
  }

  const started = performance.now()
  child = spawn(
    appBinary,
    [
      `--remote-debugging-port=${port}`,
      '--remote-allow-origins=*',
      `--user-data-dir=${userDataDirectory}`,
    ],
    {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )

  child.stdout.on('data', (chunk) => logs.push(chunk.toString()))
  child.stderr.on('data', (chunk) => logs.push(chunk.toString()))

  const target = await waitForTarget()
  cdp = await connect(target.webSocketDebuggerUrl)
  await cdp.send('Runtime.enable')

  await waitForValue(
    'document.body.innerText',
    (value) => typeof value === 'string' && value.includes('Base Case'),
    'the packaged app shell',
  )
  const coldStartMs = Math.round(performance.now() - started)

  await evaluate('window.baseCase.settings.update({ onboardingCompleted: true })')
  await cdp.send('Page.reload')
  await cdp.send('Runtime.enable')
  await waitForValue(
    "Boolean(document.querySelector('.app-shell'))",
    (value) => value === true,
    'the workspace after onboarding',
  )

  const contentStarted = performance.now()
  const problems = await evaluate('window.baseCase.content.list()')
  const contentLoadMs = Math.round(performance.now() - contentStarted)

  const judgeStatus = await evaluate('window.baseCase.judge.status()')
  const acceptedCode = `class Solution:
    def pairSum(self, nums, target):
        seen = {}
        for index, value in enumerate(nums):
            complement = target - value
            if complement in seen:
                return [seen[complement], index]
            seen[value] = index
        return []
`
  const runStarted = performance.now()
  const runResult = await evaluate(
    `window.baseCase.judge.run(${JSON.stringify({
      problemId: 'core/pair-sum',
      language: 'python',
      code: acceptedCode,
      mode: 'sample',
    })})`,
  )
  const judgeRunMs = Math.round(performance.now() - runStarted)

  await sleep(1500)
  const idleMemory = processTreeMemory(child.pid)

  const codingStart = performance.now()
  const openedCoding = await clickButtonWithText('Coding')
  await waitForValue(
    'document.body.innerText.includes("Problem library")',
    (value) => value === true,
    'the coding library',
  )
  const codingViewMs = Math.round(performance.now() - codingStart)

  const problemStart = performance.now()
  const openedProblem = await clickButtonWithText('Pair Sum')
  await waitForValue(
    "Boolean(document.querySelector('.cm-content'))",
    (value) => value === true,
    'the code editor',
  )
  const problemOpenMs = Math.round(performance.now() - problemStart)

  const designStart = performance.now()
  const openedDesign = await clickButtonWithText('System Design')
  await waitForValue(
    'document.querySelectorAll("[data-testid=design-scenario]").length > 0',
    (value) => value === true,
    'the design scenario list',
  )
  await evaluate('document.querySelector("[data-testid=design-scenario]")?.click()')
  await waitForValue(
    "Boolean(document.querySelector('.excalidraw__canvas.interactive'))",
    (value) => value === true,
    'the design canvas',
  )
  const designOpenMs = Math.round(performance.now() - designStart)

  await sleep(4000)
  const workingMemory = processTreeMemory(child.pid)

  const results = {
    appBinary,
    coldStartMs,
    contentLoadMs,
    codingViewMs: openedCoding ? codingViewMs : null,
    problemOpenMs: openedProblem ? problemOpenMs : null,
    designOpenMs: openedDesign ? designOpenMs : null,
    problems: Array.isArray(problems) ? problems.length : null,
    judgeOk: judgeStatus.ok,
    judge: `${judgeStatus.name} ${judgeStatus.version}`,
    runtimeSources: Object.fromEntries(
      Object.entries(judgeStatus.runtimes ?? {}).map(([name, info]) => [
        name,
        info.source ?? 'unknown',
      ]),
    ),
    judgeRun: `${runResult.passed}/${runResult.total} ${runResult.status}`,
    judgeRunMs,
    idleMemoryMb: idleMemory.totalMb,
    idleMainProcessMb: idleMemory.mainMb,
    workingMemoryMb: workingMemory.totalMb,
    workingMainProcessMb: workingMemory.mainMb,
    helperProcesses: workingMemory.processes,
    appBundleMb: directorySizeMb(appBundle),
    dmgMb: fileSizeMb(
      join(
        root,
        'apps/desktop/dist',
        `Base-Case-${desktopVersion}-${process.arch === 'arm64' ? 'arm64' : 'x64'}.dmg`,
      ),
    ),
    zipMb: fileSizeMb(
      join(
        root,
        'apps/desktop/dist',
        `Base-Case-${desktopVersion}-${process.arch === 'arm64' ? 'arm64' : 'x64'}.zip`,
      ),
    ),
  }

  console.log(JSON.stringify(results, null, 2))
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? (error.stack ?? error.message) : String(error))
  if (logs.length > 0) {
    console.error(logs.join('').slice(-6000))
  }
  process.exitCode = 1
} finally {
  cdp?.close()
  stopApp()
  await sleep(500)
  rmSync(userDataDirectory, { recursive: true, force: true })
}
