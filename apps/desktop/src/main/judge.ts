import {
  spawn,
  type ChildProcessWithoutNullStreams,
  type SpawnOptionsWithoutStdio,
} from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline'
import { app } from 'electron'
import type { JudgeStatus, RunResult, RuntimeInfo } from '../shared/types'
import type { JudgeRunParams } from './content'

export const JUDGE_PROTOCOL_VERSION = 1

export function isSupportedProtocolVersion(version: unknown): boolean {
  return version === JUDGE_PROTOCOL_VERSION
}

export interface JudgeEvent {
  readonly event: string
  readonly result?: unknown
}

export interface JudgeRunOptions {
  /** Correlates this run with a later `cancel(requestId)` call. */
  readonly requestId?: string
  /** Receives streaming progress events such as `test_result`. */
  readonly onEvent?: (event: JudgeEvent) => void
}

export type JudgeSpawn = (
  command: string,
  args: readonly string[],
  options: SpawnOptionsWithoutStdio,
) => ChildProcessWithoutNullStreams

export interface JudgeClientOptions {
  readonly path?: string
  readonly spawnProcess?: JudgeSpawn
}

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

interface PendingRequest {
  readonly resolve: (value: unknown) => void
  readonly reject: (error: Error) => void
  readonly timer: NodeJS.Timeout
  readonly onEvent?: (event: JudgeEvent) => void
}

interface HelloResult {
  readonly name: string
  readonly version: string
  readonly os: string
  readonly arch: string
  readonly protocolVersion: number
}

export class JudgeProtocolError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'JudgeProtocolError'
    this.code = code
  }
}

export function resolveJudgePath(): string {
  if (process.env.BASE_CASE_JUDGE_PATH) {
    return process.env.BASE_CASE_JUDGE_PATH
  }

  const binary = process.platform === 'win32' ? 'judge.exe' : 'judge'

  if (app.isPackaged) {
    return join(process.resourcesPath, 'judge', binary)
  }

  const candidates = [
    join(app.getAppPath(), '../../build', binary),
    join(app.getAppPath(), '../../../build', binary),
    join(process.cwd(), 'build', binary),
    join(process.cwd(), '../../build', binary),
  ]

  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0]!
}

export class JudgeClient {
  private readonly path: string
  private readonly spawnProcess: JudgeSpawn
  private child: ChildProcessWithoutNullStreams | null = null
  private readonly pending = new Map<string, PendingRequest>()
  private nextId = 0
  private hello: HelloResult | null = null
  private starting: Promise<void> | null = null

  constructor(options: JudgeClientOptions = {}) {
    this.path = options.path ?? resolveJudgePath()
    this.spawnProcess = options.spawnProcess ?? (spawn as unknown as JudgeSpawn)
  }

  async run(params: JudgeRunParams, options: JudgeRunOptions = {}): Promise<RunResult> {
    return this.request<RunResult>('run', params, 120_000, options)
  }

  /**
   * Cancels an in-flight run by the request id supplied to `run`. Returns false
   * when the run already finished or the sidecar is not running.
   */
  async cancel(requestId: string): Promise<boolean> {
    if (!this.child) {
      return false
    }

    const result = await this.request<{ readonly cancelled?: boolean }>(
      'cancel',
      { targetId: requestId },
      5_000,
    )

    return result?.cancelled === true
  }

  async status(): Promise<JudgeStatus> {
    try {
      await this.ensureStarted()
      const runtimes = await this.request<Record<string, RuntimeInfo>>('doctor', {}, 10_000)
      const hello = this.hello

      if (!hello) {
        throw new Error('The judge handshake did not complete.')
      }

      return {
        ok: true,
        name: hello.name,
        version: hello.version,
        os: hello.os,
        arch: hello.arch,
        runtimes,
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  stop(): void {
    const child = this.child
    if (!child) {
      return
    }

    this.child = null
    this.hello = null
    this.starting = null
    this.failAll(new Error('Judge sidecar stopped.'))

    const shutdown = `${JSON.stringify({ id: 'shutdown', method: 'shutdown' })}\n`

    try {
      if (!child.stdin.destroyed && child.stdin.writable) {
        child.stdin.end(shutdown)
      }
    } catch {
      // The process may already be gone.
    }

    setTimeout(() => {
      try {
        if (child.exitCode === null && !child.killed) {
          child.kill()
        }
      } catch {
        // The process may already be gone.
      }
    }, 500)
  }

  private ensureStarted(): Promise<void> {
    if (this.child && this.hello) {
      return Promise.resolve()
    }

    if (this.starting) {
      return this.starting
    }

    this.starting = this.start().finally(() => {
      this.starting = null
    })

    return this.starting
  }

  private async start(): Promise<void> {
    const child = this.spawnProcess(this.path, [], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    })

    this.child = child

    child.on('error', (error) => {
      if (this.child !== child) {
        return
      }
      this.child = null
      this.hello = null
      this.failAll(new Error(`Judge sidecar failed to start: ${error.message}`))
    })

    // stdin/stdout are pipes to a short-lived sidecar. When the sidecar exits
    // first, writes surface EPIPE asynchronously; an unhandled stream error
    // would otherwise crash the entire main process during shutdown.
    child.stdin.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code !== 'EPIPE') {
        console.error(`[judge] stdin error: ${error.message}`)
      }
    })
    child.stdout.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code !== 'EPIPE') {
        console.error(`[judge] stdout error: ${error.message}`)
      }
    })

    child.on('exit', (code, signal) => {
      if (this.child !== child) {
        return
      }

      this.child = null
      this.hello = null
      this.failAll(
        new Error(`Judge sidecar exited (code=${code ?? 'null'}, signal=${signal ?? 'null'})`),
      )
    })

    child.stderr.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code !== 'EPIPE') {
        console.error(`[judge] stderr error: ${error.message}`)
      }
    })

    child.stderr.on('data', (chunk: Buffer) => {
      console.error(`[judge] ${chunk.toString().trimEnd()}`)
    })

    const lines = createInterface({ input: child.stdout })
    lines.on('line', (line) => {
      this.handleLine(line)
    })

    try {
      const hello = await this.send<HelloResult>('hello', {}, 5_000)

      if (!isSupportedProtocolVersion(hello.protocolVersion)) {
        throw new JudgeProtocolError(
          'protocol_version_mismatch',
          `Judge speaks protocol version ${String(hello.protocolVersion)}, but this app supports ${JUDGE_PROTOCOL_VERSION}.`,
        )
      }

      this.hello = hello
    } catch (error) {
      if (this.child === child) {
        this.child = null
      }
      this.hello = null

      try {
        child.kill()
      } catch {
        // The process may already be gone.
      }

      throw error
    }
  }

  private handleLine(line: string): void {
    let response: JudgeResponse

    try {
      response = JSON.parse(line) as JudgeResponse
    } catch {
      console.error('[judge] Ignoring malformed response line.')
      return
    }

    // Events share the request id with their run. They are progress updates,
    // not the final response, so they must never resolve the pending request.
    if (response.event) {
      const pending = this.pending.get(response.id)
      pending?.onEvent?.({ event: response.event, result: response.result })
      return
    }

    const pending = this.pending.get(response.id)

    if (!pending) {
      return
    }

    this.pending.delete(response.id)
    clearTimeout(pending.timer)

    if (response.ok) {
      pending.resolve(response.result)
      return
    }

    pending.reject(
      new JudgeProtocolError(
        response.error?.code ?? 'unknown_error',
        response.error?.message ?? 'The judge returned an unknown error.',
      ),
    )
  }

  private async request<T>(
    method: string,
    params: unknown,
    timeoutMs: number,
    options: JudgeRunOptions = {},
  ): Promise<T> {
    await this.ensureStarted()
    return this.send<T>(method, params, timeoutMs, options)
  }

  private send<T>(
    method: string,
    params: unknown,
    timeoutMs: number,
    options: JudgeRunOptions = {},
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const child = this.child

      if (!child) {
        reject(new Error('Judge sidecar is not running.'))
        return
      }

      const id = options.requestId ?? `req-${++this.nextId}`

      if (this.pending.has(id)) {
        reject(new Error(`Judge request id ${id} is already pending.`))
        return
      }

      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`Judge request timed out after ${timeoutMs} ms.`))
      }, timeoutMs)

      this.pending.set(id, {
        resolve: (value) => resolve(value as T),
        reject,
        timer,
        onEvent: options.onEvent,
      })

      try {
        if (child.stdin.destroyed || !child.stdin.writable) {
          throw new Error('Judge sidecar input is closed.')
        }

        child.stdin.write(
          `${JSON.stringify({ id, method, params })}\n`,
          (error: NodeJS.ErrnoException | null | undefined) => {
            if (!error || error.code === 'EPIPE') {
              return
            }

            clearTimeout(timer)
            this.pending.delete(id)
            reject(error)
          },
        )
      } catch (error) {
        clearTimeout(timer)
        this.pending.delete(id)
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    })
  }

  private failAll(error: Error): void {
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer)
      pending.reject(error)
      this.pending.delete(id)
    }
  }
}
