import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createInterface } from 'node:readline'
import { validatePack, type PackValidationResult } from '@base-case/schema'
import type { PackManifest, Problem, TestCase } from '@base-case/schema'

const usage = `Base Case content CLI

Usage:
  content validate <pack-directory> [--json]
  content test <pack-directory> [--json]
  content version
  content help

Examples:
  content validate content/packs/core
  content test content/packs/core
  content validate content/packs/core --json
`

interface JudgeResponse {
  readonly id: string
  readonly event?: string
  readonly ok: boolean
  readonly result?: unknown
  readonly error?: {
    readonly code: string
    readonly message: string
  }
}

interface JudgeRunResult {
  readonly status: string
  readonly passed: number
  readonly total: number
  readonly firstFailure?: {
    readonly index: number
    readonly isSample: boolean
    readonly status: string
    readonly message?: string
    readonly actual?: unknown
    readonly expected?: unknown
  }
}

interface JudgeSession {
  request(method: string, params?: unknown): Promise<JudgeResponse>
  close(): Promise<void>
}

interface TestReport {
  readonly problemId: string
  readonly language: string
  readonly status: string
  readonly passed: number
  readonly total: number
  readonly failure?: JudgeRunResult['firstFailure']
}

function formatHumanResult(packDirectory: string, result: PackValidationResult): string {
  const lines: string[] = []

  if (result.pack) {
    lines.push(
      `Pack: ${result.pack.name} (${result.pack.id}) v${result.pack.version}`,
      `Problems: ${result.pack.problems.length}`,
      `Designs: ${result.pack.designs.length}`,
    )
  }

  if (result.warnings.length > 0) {
    lines.push('', 'Warnings:')
    for (const warning of result.warnings) {
      lines.push(`  - ${warning}`)
    }
  }

  if (result.issues.length > 0) {
    lines.push('', `Invalid pack: ${result.issues.length} issue(s)`)
    for (const issue of result.issues) {
      lines.push(`  [${issue.code}] ${issue.path}: ${issue.message}`)
    }
  } else {
    lines.push('', `Valid: ${packDirectory}`)
  }

  return lines.join('\n')
}

async function validateCommand(args: readonly string[]): Promise<number> {
  const packDirectory = args.find((argument) => !argument.startsWith('-'))
  const json = args.includes('--json')

  if (!packDirectory) {
    process.stderr.write('Missing pack directory.\n\n')
    process.stderr.write(usage)
    return 2
  }

  const result = await validatePack(packDirectory)

  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  } else {
    process.stdout.write(`${formatHumanResult(packDirectory, result)}\n`)
  }

  return result.ok ? 0 : 1
}

function resolveJudgePath(): string {
  const binary = process.platform === 'win32' ? 'judge.exe' : 'judge'
  const candidates = [
    process.env.BASE_CASE_JUDGE_PATH,
    join(process.cwd(), 'build', binary),
    join(process.cwd(), '..', '..', 'build', binary),
  ].filter((candidate): candidate is string => Boolean(candidate))
  const found = candidates.find((candidate) => existsSync(candidate))

  if (!found) {
    throw new Error('Judge binary not found. Run `pnpm judge:build` first.')
  }

  return found
}

function startJudge(judgePath: string): JudgeSession {
  const child = spawn(judgePath, [], { stdio: ['pipe', 'pipe', 'pipe'] })
  const pending = new Map<
    string,
    {
      readonly resolve: (response: JudgeResponse) => void
      readonly reject: (error: Error) => void
      readonly timer: NodeJS.Timeout
    }
  >()
  let nextId = 0
  let exited = false

  const lines = createInterface({ input: child.stdout })

  lines.on('line', (line) => {
    let response: JudgeResponse

    try {
      response = JSON.parse(line) as JudgeResponse
    } catch {
      return
    }

    if (response.event) {
      return
    }

    const entry = pending.get(response.id)

    if (!entry) {
      return
    }

    clearTimeout(entry.timer)
    pending.delete(response.id)
    entry.resolve(response)
  })

  child.on('exit', () => {
    exited = true

    for (const [id, entry] of pending) {
      clearTimeout(entry.timer)
      entry.reject(new Error(`The judge exited before answering ${id}.`))
    }
    pending.clear()
  })

  child.stderr.on('data', () => {
    // The protocol reports failures on stdout; stderr is only for crashes.
  })

  return {
    request(method: string, params?: unknown): Promise<JudgeResponse> {
      if (exited) {
        return Promise.reject(new Error('The judge is not running.'))
      }

      const id = `content-cli-${++nextId}`

      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id)
          reject(new Error(`The judge timed out while running ${method}.`))
        }, 120_000)

        pending.set(id, { resolve, reject, timer })
        child.stdin.write(
          `${JSON.stringify({ id, method, ...(params === undefined ? {} : { params }) })}\n`,
        )
      })
    },
    async close(): Promise<void> {
      if (!exited) {
        try {
          await new Promise<void>((resolve) => {
            const timer = setTimeout(resolve, 2000)
            child.once('exit', () => {
              clearTimeout(timer)
              resolve()
            })
            child.stdin.write(`${JSON.stringify({ id: 'shutdown', method: 'shutdown' })}\n`)
          })
        } catch {
          // The process may already be gone.
        }
      }

      if (!exited) {
        child.kill()
      }
    },
  }
}

async function readJsonl(path: string): Promise<TestCase[]> {
  const text = await readFile(path, 'utf8')

  return text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as TestCase)
}

async function testCommand(args: readonly string[]): Promise<number> {
  const packDirectory = args.find((argument) => !argument.startsWith('-'))
  const json = args.includes('--json')

  if (!packDirectory) {
    process.stderr.write('Missing pack directory.\n\n')
    process.stderr.write(usage)
    return 2
  }

  const validation = await validatePack(packDirectory)

  if (!validation.ok || !validation.pack) {
    process.stderr.write(`${formatHumanResult(packDirectory, validation)}\n`)
    return 1
  }

  const manifest = validation.pack as PackManifest
  const judge = startJudge(resolveJudgePath())
  const reports: TestReport[] = []

  try {
    const hello = await judge.request('hello')
    const protocolVersion = hello.ok
      ? (hello.result as { protocolVersion?: number }).protocolVersion
      : undefined

    if (!hello.ok || protocolVersion !== 1) {
      throw new Error(
        `The judge protocol is not compatible (expected 1, got ${protocolVersion ?? 'none'}).`,
      )
    }

    for (const slug of manifest.problems) {
      const problemDirectory = join(packDirectory, 'problems', slug)
      const problem = JSON.parse(
        await readFile(join(problemDirectory, 'problem.json'), 'utf8'),
      ) as Problem
      const sample = await readJsonl(join(problemDirectory, problem.tests.sample))
      const hidden = await readJsonl(join(problemDirectory, problem.tests.hidden))
      const tests = [
        ...sample.map((test, index) => ({
          index,
          isSample: true,
          input: test.input,
          expected: test.expected,
        })),
        ...hidden.map((test, index) => ({
          index: sample.length + index,
          isSample: false,
          input: test.input,
          expected: test.expected,
        })),
      ]

      for (const solution of problem.solutions) {
        const code = await readFile(join(problemDirectory, solution.path), 'utf8')
        const response = await judge.request('run', {
          problemId: problem.id,
          language: solution.language,
          code,
          mode: 'submit',
          signature: problem.signature,
          limits: problem.limits,
          checker: problem.checker,
          tests,
        })

        if (!response.ok) {
          reports.push({
            problemId: problem.id,
            language: solution.language,
            status: 'protocol_error',
            passed: 0,
            total: tests.length,
            failure: {
              index: -1,
              isSample: false,
              status: 'protocol_error',
              message: response.error?.message ?? 'The judge rejected the request.',
            },
          })
          continue
        }

        const result = response.result as JudgeRunResult
        reports.push({
          problemId: problem.id,
          language: solution.language,
          status: result.status,
          passed: result.passed,
          total: result.total,
          failure: result.firstFailure,
        })
      }
    }
  } finally {
    await judge.close()
  }

  const failures = reports.filter((report) => report.status !== 'accepted')

  if (json) {
    process.stdout.write(`${JSON.stringify({ ok: failures.length === 0, reports }, null, 2)}\n`)
  } else {
    for (const report of reports) {
      const marker = report.status === 'accepted' ? 'PASS' : 'FAIL'
      process.stdout.write(
        `${marker} ${report.problemId} [${report.language}] ${report.status} ${report.passed}/${report.total}\n`,
      )

      if (report.failure) {
        const testLabel = report.failure.index >= 0 ? `test ${report.failure.index}` : 'request'
        process.stdout.write(
          `     ${testLabel} (${report.failure.isSample ? 'sample' : 'hidden'}): ${report.failure.status}`,
        )

        if (report.failure.message) {
          process.stdout.write(` — ${report.failure.message}`)
        }

        process.stdout.write('\n')
      }
    }

    process.stdout.write(
      `\n${reports.length - failures.length}/${reports.length} reference solutions passed.\n`,
    )
  }

  return failures.length === 0 ? 0 : 1
}

async function main(args: readonly string[]): Promise<number> {
  const [command, ...rest] = args

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    process.stdout.write(usage)
    return command ? 0 : 2
  }

  if (command === 'version' || command === '--version' || command === '-v') {
    process.stdout.write('0.0.0\n')
    return 0
  }

  if (command === 'validate') {
    return validateCommand(rest)
  }

  if (command === 'test') {
    return testCommand(rest)
  }

  process.stderr.write(`Unknown command: ${command}\n\n`)
  process.stderr.write(usage)
  return 2
}

try {
  process.exitCode = await main(process.argv.slice(2))
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  )
  process.exitCode = 1
}
