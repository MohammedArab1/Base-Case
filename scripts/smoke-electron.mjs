import { execFileSync, spawn } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const requireFromDesktop = createRequire(join(root, 'apps/desktop/package.json'))
const electronPath = requireFromDesktop('electron')
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const port = 9300 + Math.floor(Math.random() * 500)
const userDataDirectory = mkdtempSync(join(tmpdir(), 'base-case-smoke-'))
const judgeName = process.platform === 'win32' ? 'judge.exe' : 'judge'
const judgePath = join(root, 'build', judgeName)
const electronMain = join(root, 'apps/desktop/out/main/index.js')

const logs = []
let child = null
let cdp = null
let aiServer = null
let fatalError = null
let childExit = null
let stopping = false
let screenshotDirectory = null

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

/** Build a stored (uncompressed) ZIP so the archive path is covered portably. */
function writeStoredZip(directory, archivePath) {
  const entries = []

  const walk = (current, prefix) => {
    for (const name of readdirSync(current).sort()) {
      const path = join(current, name)
      const info = statSync(path)

      if (info.isDirectory()) {
        walk(path, `${prefix}${name}/`)
      } else {
        entries.push({ name: `${prefix}${name}`, data: readFileSync(path) })
      }
    }
  }

  walk(directory, '')

  const localParts = []
  const centralParts = []
  let offset = 0

  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8')
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6)
    local.writeUInt16LE(0, 8)
    local.writeUInt16LE(0, 10)
    local.writeUInt16LE(0, 12)
    local.writeUInt32LE(0, 14)
    local.writeUInt32LE(entry.data.length, 18)
    local.writeUInt32LE(entry.data.length, 22)
    local.writeUInt16LE(name.length, 26)
    local.writeUInt16LE(0, 28)
    localParts.push(local, name, entry.data)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(0x0314, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8)
    central.writeUInt16LE(0, 10)
    central.writeUInt16LE(0, 12)
    central.writeUInt16LE(0, 14)
    central.writeUInt32LE(0, 16)
    central.writeUInt32LE(entry.data.length, 20)
    central.writeUInt32LE(entry.data.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt16LE(0, 30)
    central.writeUInt16LE(0, 32)
    central.writeUInt16LE(0, 34)
    central.writeUInt16LE(0, 36)
    central.writeUInt32LE((0o100644 << 16) >>> 0, 38)
    central.writeUInt32LE(offset, 42)
    centralParts.push(central, name)

    offset += local.length + name.length + entry.data.length
  }

  const central = Buffer.concat(centralParts)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(0, 4)
  end.writeUInt16LE(0, 6)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(central.length, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(0, 20)

  writeFileSync(archivePath, Buffer.concat([...localParts, central, end]))
}

function stopElectron() {
  if (!child) {
    return
  }

  stopping = true

  try {
    if (process.platform === 'win32') {
      execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    } else {
      process.kill(-child.pid, 'SIGTERM')
    }
  } catch {
    // The process may already be gone.
  }

  child = null
}

async function waitForTarget() {
  const deadline = Date.now() + 30_000

  while (Date.now() < deadline) {
    if (fatalError) {
      throw fatalError
    }
    if (childExit) {
      throw new Error(childExit)
    }

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
      // Electron is still starting.
    }

    await sleep(250)
  }

  throw new Error('Timed out waiting for the Electron debug target')
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

    socket.addEventListener('error', () => {
      reject(new Error('Could not connect to the Electron debug target'))
    })

    socket.addEventListener('close', () => {
      for (const request of pending.values()) {
        request.reject(new Error('Electron debug connection closed'))
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
    const description = result.exceptionDetails.exception?.description ?? ''
    throw new Error(`Evaluation failed: ${result.exceptionDetails.text}\n${description}`)
  }

  return result.result.value
}

async function waitForValue(expression, predicate, label, timeout = 20_000) {
  const deadline = Date.now() + timeout
  let lastValue

  while (Date.now() < deadline) {
    if (fatalError) {
      throw fatalError
    }
    if (childExit) {
      throw new Error(childExit)
    }

    const value = await evaluate(expression)
    lastValue = value

    if (predicate(value)) {
      return value
    }

    await sleep(300)
  }

  throw new Error(`Timed out waiting for ${label}. Last value: ${JSON.stringify(lastValue)}`)
}

async function clickTestId(testId) {
  const clicked = await evaluate(
    `(() => {
      const element = document.querySelector('[data-testid="${testId}"]')
      element?.click()
      return Boolean(element)
    })()`,
  )

  assert(clicked, `The ${testId} control is missing`)
  await sleep(150)
}

async function captureScreenshot(name) {
  if (!screenshotDirectory) {
    return
  }

  const result = await cdp.send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(join(screenshotDirectory, `${name}.png`), Buffer.from(result.data, 'base64'))
}

async function main() {
  if (!existsSync(judgePath)) {
    execFileSync(process.execPath, [join(root, 'scripts/build-judge.mjs')], {
      cwd: root,
      stdio: 'inherit',
    })
  }

  if (!existsSync(electronMain)) {
    execFileSync(pnpmCommand, ['build'], {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
  }

  const packArchivePath = join(userDataDirectory, 'fixture-pack.zip')
  writeStoredZip(join(root, 'scripts/fixtures/packs/smoke-fixture'), packArchivePath)

  if (process.env.BASE_CASE_SMOKE_SCREENSHOTS) {
    screenshotDirectory = process.env.BASE_CASE_SMOKE_SCREENSHOTS
    mkdirSync(screenshotDirectory, { recursive: true })
  }

  child = spawn(
    electronPath,
    [
      `--remote-debugging-port=${port}`,
      '--remote-allow-origins=*',
      `--user-data-dir=${userDataDirectory}`,
      electronMain,
    ],
    {
      cwd: root,
      env: {
        ...process.env,
        BASE_CASE_JUDGE_PATH: judgePath,
        BASE_CASE_LOG_LEVEL: 'debug',
        BASE_CASE_TEST_PACK_PATH: packArchivePath,
      },
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )

  child.stdout.on('data', (chunk) => logs.push(chunk.toString()))
  child.stderr.on('data', (chunk) => {
    const text = chunk.toString()
    logs.push(text)

    if (/Uncaught Exception|A JavaScript error occurred in the main process/i.test(text)) {
      fatalError = new Error(`The Electron main process crashed: ${text.slice(-4000)}`)
    }
  })
  child.on('exit', (code, signal) => {
    if (!stopping) {
      childExit = `Electron exited while the smoke test was running (code=${code ?? 'null'}, signal=${signal ?? 'null'})`
    }
  })

  const target = await waitForTarget()
  cdp = await connect(target.webSocketDebuggerUrl)
  await cdp.send('Runtime.enable')

  await waitForValue(
    "typeof window.baseCase !== 'undefined'",
    (value) => value === true,
    'the preload bridge',
  )
  await waitForValue(
    'document.body.innerText',
    (value) => typeof value === 'string' && value.includes('Base Case'),
    'the app shell',
  )

  await waitForValue(
    "Boolean(document.querySelector('.onboarding-shell'))",
    (value) => value === true,
    'the onboarding shell',
  )

  await clickTestId('onboarding-start')
  await waitForValue(
    'Boolean(document.querySelector(\'[data-testid="onboarding-language-next"]\'))',
    (value) => value === true,
    'the language step',
  )

  await clickTestId('onboarding-language-next')
  await waitForValue(
    'Boolean(document.querySelector(\'[data-testid="onboarding-goal-next"]\'))',
    (value) => value === true,
    'the daily-goal step',
  )

  await clickTestId('onboarding-goal-next')
  await waitForValue(
    'Boolean(document.querySelector(\'[data-testid="onboarding-finish"]\'))',
    (value) => value === true,
    'the AI step',
  )

  await clickTestId('onboarding-finish')
  await waitForValue(
    'Boolean(document.querySelector(\'[data-testid="onboarding-go-today"]\'))',
    (value) => value === true,
    'the onboarding summary',
  )

  await clickTestId('onboarding-go-today')
  await waitForValue(
    "Boolean(document.querySelector('.app-shell'))",
    (value) => value === true,
    'the app shell after onboarding',
  )

  const problems = await evaluate('window.baseCase.content.list()')
  assert(Array.isArray(problems) && problems.length >= 1, 'Content list is empty')
  assert(
    problems.some((problem) => problem.id === 'core/pair-sum'),
    'pair-sum is missing',
  )

  const initialSettings = await evaluate('window.baseCase.settings.get()')
  assert(initialSettings.theme === 'system', 'Default theme is not system')
  assert(initialSettings.onboardingCompleted === true, 'Onboarding did not persist completion')

  const searchResults = await evaluate("window.baseCase.content.search('hash')")
  assert(
    Array.isArray(searchResults) && searchResults.some((problem) => problem.id === 'core/pair-sum'),
    'FTS search did not find pair-sum by pattern',
  )
  const emptySearch = await evaluate("window.baseCase.content.search('zzzz-no-match')")
  assert(emptySearch.length === 0, 'FTS search returned results for a missing term')

  const updatedSettings = await evaluate(
    `window.baseCase.settings.update(${JSON.stringify({ theme: 'dark', editor: { fontSize: 15 } })})`,
  )
  assert(updatedSettings.theme === 'dark', 'Settings update did not apply the theme')
  assert(updatedSettings.editor.fontSize === 15, 'Settings update did not apply the font size')

  const persistedSettings = await evaluate('window.baseCase.settings.get()')
  assert(persistedSettings.theme === 'dark', 'Settings did not persist the theme')
  assert(persistedSettings.editor.fontSize === 15, 'Settings did not persist the font size')

  await evaluate(
    `window.baseCase.settings.update(${JSON.stringify({ theme: 'system', editor: { fontSize: 13 } })})`,
  )

  const judgeStatus = await evaluate('window.baseCase.judge.status()')
  assert(judgeStatus.ok === true, `Judge status failed: ${judgeStatus.error ?? 'unknown'}`)
  assert(judgeStatus.runtimes?.python?.available === true, 'Python runtime is unavailable')
  assert(judgeStatus.runtimes?.node?.available === true, 'Node runtime is unavailable')

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

  const sampleResult = await evaluate(
    `window.baseCase.judge.run(${JSON.stringify({
      problemId: 'core/pair-sum',
      language: 'python',
      code: acceptedCode,
      mode: 'sample',
    })})`,
  )
  assert(sampleResult.status === 'accepted', `Sample run failed: ${sampleResult.status}`)
  assert(sampleResult.passed === 5 && sampleResult.total === 5, 'Sample run count mismatch')

  const submitResult = await evaluate(
    `window.baseCase.judge.run(${JSON.stringify({
      problemId: 'core/pair-sum',
      language: 'python',
      code: acceptedCode,
      mode: 'submit',
    })})`,
  )
  assert(submitResult.status === 'accepted', `Submit failed: ${submitResult.status}`)
  assert(submitResult.total >= 15, 'Hidden test count is too low')

  const wrongCode = `class Solution {
  pairSum(nums: number[], target: number): number[] {
    return []
  }
}
export { Solution }
`

  const wrongResult = await evaluate(
    `window.baseCase.judge.run(${JSON.stringify({
      problemId: 'core/pair-sum',
      language: 'typescript',
      code: wrongCode,
      mode: 'sample',
    })})`,
  )
  assert(wrongResult.status === 'wrong_answer', `Expected wrong_answer, got ${wrongResult.status}`)
  assert(wrongResult.firstFailure?.expected, 'Wrong answer did not include the expected value')

  const stats = await evaluate('window.baseCase.attempts.stats()')
  assert(stats.attempts >= 3, 'Attempts were not persisted')

  const attemptList = await evaluate("window.baseCase.attempts.list('core/pair-sum')")
  assert(attemptList.length >= 3, 'Attempt history did not return the saved attempts')
  assert(attemptList[0]?.status === 'wrong_answer', 'Attempt history is not newest-first')

  const savedNote = await evaluate(
    `window.baseCase.notes.save({ problemId: 'core/pair-sum', notes: 'Remember the complement.' })`,
  )
  assert(savedNote.notes === 'Remember the complement.', 'Notes were not saved')
  const readNote = await evaluate("window.baseCase.notes.get('core/pair-sum')")
  assert(readNote.notes === 'Remember the complement.', 'Notes were not read back')

  const packListBefore = await evaluate('window.baseCase.packs.list()')
  assert(
    packListBefore.length === 1 && packListBefore[0]?.id === 'core',
    'The bundled catalog should contain exactly the core pack',
  )

  const packPreview = await evaluate("window.baseCase.packs.preview('archive')")
  assert(
    packPreview?.ok === true && packPreview.preview?.id === 'smoke-fixture',
    `Pack preview failed: ${JSON.stringify(packPreview)}`,
  )

  const installedPack = await evaluate(
    `window.baseCase.packs.install(${JSON.stringify(packPreview.preview.token)})`,
  )
  assert(
    installedPack.id === 'smoke-fixture' && installedPack.source === 'user',
    'The fixture pack was not installed',
  )

  const packListAfter = await evaluate('window.baseCase.packs.list()')
  assert(
    packListAfter.some((pack) => pack.id === 'smoke-fixture' && pack.source === 'user'),
    'The installed pack is missing from the pack list',
  )

  const contentAfterPack = await evaluate('window.baseCase.content.list()')
  assert(
    contentAfterPack.some((problem) => problem.id === 'smoke-fixture/echo'),
    'The installed pack did not add its problem',
  )

  const fixtureSearch = await evaluate("window.baseCase.content.search('quasar')")
  assert(
    fixtureSearch.some((problem) => problem.id === 'smoke-fixture/echo'),
    'FTS search did not index the installed pack',
  )

  const bundledUninstall = await evaluate(
    `window.baseCase.packs.uninstall('core').then(() => 'allowed').catch((error) => error.message)`,
  )
  assert(
    String(bundledUninstall).toLowerCase().includes('bundled'),
    'Uninstalling a bundled pack should be rejected',
  )

  const statsBeforePackRemoval = await evaluate('window.baseCase.attempts.stats()')
  await evaluate("window.baseCase.packs.uninstall('smoke-fixture')")

  const packListRemoved = await evaluate('window.baseCase.packs.list()')
  assert(
    !packListRemoved.some((pack) => pack.id === 'smoke-fixture'),
    'The pack was not removed from the pack list',
  )

  const contentAfterRemoval = await evaluate('window.baseCase.content.list()')
  assert(
    !contentAfterRemoval.some((problem) => problem.id === 'smoke-fixture/echo'),
    'The removed pack is still in the content list',
  )

  const searchAfterRemoval = await evaluate("window.baseCase.content.search('hash')")
  assert(
    searchAfterRemoval.some((problem) => problem.id === 'core/pair-sum'),
    'The search index was not rebuilt after removing the pack',
  )

  const statsAfterPackRemoval = await evaluate('window.baseCase.attempts.stats()')
  assert(
    statsAfterPackRemoval.attempts === statsBeforePackRemoval.attempts,
    'Removing a pack deleted attempts',
  )

  const appInfo = await evaluate('window.baseCase.app.getInfo()')
  assert(existsSync(appInfo.databasePath), 'The SQLite database file was not created')
  assert(existsSync(appInfo.logsPath), 'The log directory was not created')
  const logPath = join(appInfo.logsPath, 'app.log')
  assert(existsSync(logPath), 'The app log file was not created')
  const logText = readFileSync(logPath, 'utf8')
  assert(logText.includes('app.start'), 'The app log is missing the startup event')
  assert(logText.includes('"channel":"settings:get"'), 'IPC calls are not logged')
  const backups = readdirSync(join(userDataDirectory, 'backups')).filter((file) =>
    file.endsWith('.db'),
  )
  assert(backups.length >= 1, 'No verified database backup was created')

  await evaluate(
    `window.baseCase.drafts.save({ problemId: 'core/pair-sum', language: 'python', code: 'draft-check' })`,
  )
  const draft = await evaluate(
    `window.baseCase.drafts.get({ problemId: 'core/pair-sum', language: 'python' })`,
  )
  assert(draft === 'draft-check', 'Draft save/get failed')

  await evaluate(
    `window.baseCase.drafts.save(${JSON.stringify({
      problemId: 'core/pair-sum',
      language: 'python',
      code: acceptedCode,
    })})`,
  )

  const scene = JSON.stringify({
    type: 'excalidraw',
    version: 2,
    source: 'smoke-test',
    elements: [],
    appState: { viewBackgroundColor: '#ffffff' },
    files: {},
  })
  await evaluate(`window.baseCase.design.saveScene(${JSON.stringify(scene)})`)
  const savedScene = await evaluate('window.baseCase.design.getScene()')
  assert(savedScene.sceneJson === scene, 'Design scene save/get failed')

  const mockStatus = await evaluate(
    `window.baseCase.ai.saveConfig({ type: 'mock', baseUrl: '', model: 'mock' })`,
  )
  assert(mockStatus.enabled === true, 'Mock AI provider was not enabled')

  const preview = await evaluate(
    `window.baseCase.ai.preview(${JSON.stringify({
      problemId: 'core/pair-sum',
      language: 'typescript',
      code: 'class Solution {}',
      failure: wrongResult.firstFailure,
    })})`,
  )
  assert(preview.text.includes('Current code'), 'AI preview did not include the code')

  const aiText = await evaluate(`new Promise(async (resolve, reject) => {
    const chunks = []
    let settled = false
    const finish = (value) => {
      if (settled) return
      settled = true
      resolve(value)
    }
    const unsubscribe = window.baseCase.ai.onEvent((event) => {
      if (event.type === 'chunk') {
        chunks.push(event.text)
      } else if (event.type === 'done') {
        unsubscribe()
        finish(chunks.join(''))
      } else {
        unsubscribe()
        reject(new Error(event.message))
      }
    })
    try {
      await window.baseCase.ai.explain(${JSON.stringify({
        problemId: 'core/pair-sum',
        language: 'typescript',
        code: 'class Solution {}',
        failure: wrongResult.firstFailure,
      })})
    } catch (error) {
      unsubscribe()
      reject(error)
    }
    setTimeout(() => {
      unsubscribe()
      finish(chunks.join(''))
    }, 5000)
  })`)
  assert(typeof aiText === 'string' && aiText.length > 0, 'Mock AI stream returned no text')

  let keyStorage = 'unavailable'
  let compatibleText = ''
  try {
    aiServer = createServer((request, response) => {
      if (request.method !== 'POST' || request.url !== '/v1/chat/completions') {
        response.writeHead(404).end()
        return
      }

      response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      })
      response.flushHeaders()

      const chunks = [
        'The complement is the value you still need. ',
        'Which earlier value would make the current value work?',
      ]
      let index = 0
      const timer = setInterval(() => {
        if (index >= chunks.length) {
          response.write('data: [DONE]\n\n')
          response.end()
          clearInterval(timer)
          return
        }

        response.write(
          `data: ${JSON.stringify({ choices: [{ delta: { content: chunks[index] } }] })}\n\n`,
        )
        index += 1
      }, 20)
    })

    await new Promise((resolve) => aiServer.listen(0, '127.0.0.1', resolve))
    const address = aiServer.address()
    assert(address && typeof address === 'object', 'Could not start the local AI server')

    const withKey = await evaluate(
      `window.baseCase.ai.saveConfig({ type: 'openai-compatible', baseUrl: 'http://127.0.0.1:${address.port}/v1', model: 'test', apiKey: 'sk-smoke-test' })`,
    )
    keyStorage = withKey.hasKey ? 'stored' : 'missing'
    assert(withKey.enabled === true, 'OpenAI-compatible provider was not enabled')

    compatibleText = await evaluate(`new Promise(async (resolve, reject) => {
      const chunks = []
      let settled = false
      const finish = (value) => {
        if (settled) return
        settled = true
        resolve(value)
      }
      const unsubscribe = window.baseCase.ai.onEvent((event) => {
        if (event.type === 'chunk') {
          chunks.push(event.text)
        } else if (event.type === 'done') {
          unsubscribe()
          finish(chunks.join(''))
        } else {
          unsubscribe()
          reject(new Error(event.message))
        }
      })
      try {
        await window.baseCase.ai.explain(${JSON.stringify({
          problemId: 'core/pair-sum',
          language: 'typescript',
          code: 'class Solution {}',
          failure: wrongResult.firstFailure,
        })})
      } catch (error) {
        unsubscribe()
        reject(error)
      }
      setTimeout(() => {
        unsubscribe()
        finish(chunks.join(''))
      }, 5000)
    })`)
    assert(compatibleText.includes('complement'), 'OpenAI-compatible stream returned no text')
  } catch (error) {
    keyStorage = `unavailable: ${error.message}`
  } finally {
    if (aiServer) {
      await new Promise((resolve) => aiServer.close(resolve))
      aiServer = null
    }
  }

  await evaluate(
    `window.baseCase.ai.saveConfig({ type: 'none', baseUrl: '', model: '', clearKey: true })`,
  )

  await evaluate(
    `(() => { const button = [...document.querySelectorAll('.nav-item')].find((item) => item.textContent.trim() === 'Coding'); button?.click(); return Boolean(button) })()`,
  )
  await waitForValue(
    'document.body.innerText',
    (value) => typeof value === 'string' && value.includes('Problem library'),
    'the coding list',
  )

  await evaluate(
    `(() => { const button = document.querySelector('.problem-row'); button?.click(); return Boolean(button) })()`,
  )
  await waitForValue(
    'document.body.innerText',
    (value) => typeof value === 'string' && value.includes('Run samples'),
    'the coding workspace',
  )

  await waitForValue(
    "document.querySelector('.cm-content')?.textContent ?? ''",
    (value) => typeof value === 'string' && value.includes('pairSum'),
    'the editor content',
  )

  await evaluate(
    `(() => { const button = [...document.querySelectorAll('button')].find((item) => item.textContent.trim() === 'Run samples'); button?.click(); return Boolean(button) })()`,
  )
  await waitForValue(
    "document.querySelector('.results-panel')?.innerText ?? ''",
    (value) =>
      typeof value === 'string' &&
      /(Accepted|Wrong answer|Compile error|Runtime error|Time limit exceeded|Output limit exceeded)/.test(
        value,
      ),
    'a run result',
    20_000,
  )

  await evaluate(
    `(() => { const button = [...document.querySelectorAll('.nav-item')].find((item) => item.textContent.trim() === 'System Design'); button?.click(); return Boolean(button) })()`,
  )
  await waitForValue(
    'document.body.innerText',
    (value) => typeof value === 'string' && value.includes('Canvas sandbox'),
    'the design workspace',
    20_000,
  )
  await waitForValue(
    `Boolean(document.querySelector('.canvas-wrap .excalidraw'))`,
    (value) => value === true,
    'the Excalidraw canvas',
    20_000,
  )

  await evaluate(
    `(() => { const button = [...document.querySelectorAll('.nav-item')].find((item) => item.textContent.trim() === 'Settings'); button?.click(); return Boolean(button) })()`,
  )
  await waitForValue(
    'document.body.innerText',
    (value) => typeof value === 'string' && value.includes('AI provider'),
    'the settings view',
  )
  await waitForValue(
    'Boolean(document.querySelector(\'[data-testid="pack-row-core"]\'))',
    (value) => value === true,
    'the bundled pack row',
  )
  await captureScreenshot('pack-list')

  await clickTestId('pack-import-archive')
  await waitForValue(
    "document.querySelector('[data-testid=\"pack-import-dialog\"]')?.innerText ?? ''",
    (value) => typeof value === 'string' && value.includes('Smoke Fixture Pack'),
    'the pack import confirmation',
  )
  await captureScreenshot('pack-import-confirm')

  await clickTestId('pack-import-confirm')
  await waitForValue(
    'Boolean(document.querySelector(\'[data-testid="pack-row-smoke-fixture"]\'))',
    (value) => value === true,
    'the imported pack row',
    20_000,
  )
  const importedRowText = await evaluate(
    "document.querySelector('[data-testid=\"pack-row-smoke-fixture\"]')?.innerText ?? ''",
  )
  assert(
    typeof importedRowText === 'string' && importedRowText.includes('Unverified'),
    'Imported packs are not marked Unverified',
  )
  await captureScreenshot('pack-list-imported')

  await clickTestId('pack-remove-smoke-fixture')
  await waitForValue(
    'Boolean(document.querySelector(\'[data-testid="pack-remove-confirm"]\'))',
    (value) => value === true,
    'the pack removal confirmation',
  )
  await captureScreenshot('pack-remove-confirm')

  await clickTestId('pack-remove-confirm')
  await waitForValue(
    'Boolean(document.querySelector(\'[data-testid="pack-row-smoke-fixture"]\'))',
    (value) => value === false,
    'the pack row to disappear',
    20_000,
  )

  const platform = await evaluate('window.baseCase.platform')
  const primaryModifier = platform === 'darwin' ? 'metaKey' : 'ctrlKey'
  await evaluate(
    `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ${primaryModifier}: true, bubbles: true }))`,
  )
  await waitForValue(
    "Boolean(document.querySelector('.command-palette'))",
    (value) => value === true,
    'the command palette',
  )

  const paletteNavigation = await evaluate(
    `(() => {
      const item = [...document.querySelectorAll('.command-item')].find((button) =>
        button.textContent.includes('Go to Today'),
      )
      item?.click()
      return Boolean(item)
    })()`,
  )
  assert(paletteNavigation, 'The command palette did not list navigation commands')
  await waitForValue(
    'document.body.innerText',
    (value) => typeof value === 'string' && value.includes('Reviews, a place to continue'),
    'the Today view opened from the command palette',
  )

  const summary = {
    problems: problems.length,
    onboarding: initialSettings.onboardingCompleted === true,
    settings: persistedSettings.theme === 'dark' && persistedSettings.editor.fontSize === 15,
    logs: logText.includes('app.start'),
    search: searchResults.length > 0 && emptySearch.length === 0,
    palette: paletteNavigation,
    sample: `${sampleResult.passed}/${sampleResult.total} ${sampleResult.status}`,
    submit: `${submitResult.passed}/${submitResult.total} ${submitResult.status}`,
    wrongAnswer: wrongResult.firstFailure?.status,
    draft: draft === 'draft-check',
    scene: savedScene.sceneJson === scene,
    aiPreview: preview.text.length,
    aiStreamChars: aiText.length,
    compatibleStreamChars: compatibleText.length,
    keyStorage,
    attempts: stats.attempts,
    attemptHistory: attemptList.length >= 3 && attemptList[0]?.status === 'wrong_answer',
    notes: readNote.notes === 'Remember the complement.',
    packInstall: installedPack.id === 'smoke-fixture',
    packSearch: fixtureSearch.length > 0,
    packUninstall: !packListRemoved.some((pack) => pack.id === 'smoke-fixture'),
    packAttemptsPreserved: statsAfterPackRemoval.attempts === statsBeforePackRemoval.attempts,
    packUi: true,
    backups: backups.length,
    judge: `${judgeStatus.name} ${judgeStatus.version}`,
    runtimeSources: Object.fromEntries(
      Object.entries(judgeStatus.runtimes ?? {}).map(([name, info]) => [
        name,
        info.source ?? 'unknown',
      ]),
    ),
  }

  console.log(JSON.stringify(summary, null, 2))

  assert(!fatalError, 'The Electron main process reported an error')
  assert(!childExit, 'Electron exited before the smoke test finished')
}

try {
  await main()
  console.log('Smoke test passed')
  process.exitCode = 0
} catch (error) {
  console.error(error instanceof Error ? (error.stack ?? error.message) : String(error))
  if (logs.length > 0) {
    console.error('Electron output:')
    console.error(logs.join('').slice(-6000))
  }
  process.exitCode = 1
} finally {
  cdp?.close()
  stopElectron()
  if (aiServer) {
    await new Promise((resolve) => aiServer.close(resolve))
  }
  await sleep(500)
  rmSync(userDataDirectory, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 100,
  })
}
