import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const port = 9300 + Math.floor(Math.random() * 500)
const userDataDirectory = mkdtempSync(join(tmpdir(), 'base-case-smoke-'))
const judgeName = process.platform === 'win32' ? 'judge.exe' : 'judge'
const judgePath = join(root, 'build', judgeName)
const electronMain = join(root, 'apps/desktop/out/main/index.js')

const logs = []
let child = null
let cdp = null
let aiServer = null

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function stopElectron() {
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
    // The process may already be gone.
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
    const value = await evaluate(expression)
    lastValue = value

    if (predicate(value)) {
      return value
    }

    await sleep(300)
  }

  throw new Error(`Timed out waiting for ${label}. Last value: ${JSON.stringify(lastValue)}`)
}

async function main() {
  if (!existsSync(judgePath)) {
    execFileSync(process.execPath, [join(root, 'scripts/build-judge.mjs')], {
      cwd: root,
      stdio: 'inherit',
    })
  }

  if (!existsSync(electronMain)) {
    execFileSync('pnpm', ['build'], { cwd: root, stdio: 'inherit' })
  }

  child = spawn(
    'pnpm',
    [
      '--filter',
      '@base-case/desktop',
      'exec',
      'electron',
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
      },
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
    "typeof window.baseCase !== 'undefined'",
    (value) => value === true,
    'the preload bridge',
  )
  await waitForValue(
    'document.body.innerText',
    (value) => typeof value === 'string' && value.includes('Base Case'),
    'the app shell',
  )

  const problems = await evaluate('window.baseCase.content.list()')
  assert(Array.isArray(problems) && problems.length >= 1, 'Content list is empty')
  assert(
    problems.some((problem) => problem.id === 'core/pair-sum'),
    'pair-sum is missing',
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

  const appInfo = await evaluate('window.baseCase.app.getInfo()')
  assert(existsSync(appInfo.databasePath), 'The SQLite database file was not created')
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
    (value) => typeof value === 'string' && value.includes('Core pack'),
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

  const summary = {
    problems: problems.length,
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
    backups: backups.length,
    judge: `${judgeStatus.name} ${judgeStatus.version}`,
  }

  console.log(JSON.stringify(summary, null, 2))
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
  rmSync(userDataDirectory, { recursive: true, force: true })
}
