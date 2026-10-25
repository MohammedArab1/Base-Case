import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import type { JudgeRunParams } from './content'
import {
  isSupportedProtocolVersion,
  JUDGE_PROTOCOL_VERSION,
  JudgeClient,
  type JudgeEvent,
  type JudgeSpawn,
} from './judge'

interface FakeRequest {
  readonly id: string
  readonly method: string
  readonly params?: Record<string, unknown>
}

type Respond = (response: Record<string, unknown>) => void
type Handler = (request: FakeRequest, respond: Respond) => void

class FakeChild extends EventEmitter {
  readonly stdin = new PassThrough()
  readonly stdout = new PassThrough()
  readonly stderr = new PassThrough()
  exitCode: number | null = null
  killed = false

  private buffer = ''

  constructor(handler: Handler) {
    super()

    this.stdin.on('data', (chunk: Buffer) => {
      this.buffer += chunk.toString()

      let newline = this.buffer.indexOf('\n')
      while (newline >= 0) {
        const line = this.buffer.slice(0, newline).trim()
        this.buffer = this.buffer.slice(newline + 1)

        if (line) {
          handler(JSON.parse(line) as FakeRequest, (response) => this.respond(response))
        }

        newline = this.buffer.indexOf('\n')
      }
    })
  }

  kill(): boolean {
    this.killed = true
    this.exitCode = 0
    this.emit('exit', 0, null)
    return true
  }

  private respond(response: Record<string, unknown>): void {
    this.stdout.write(`${JSON.stringify(response)}\n`)
  }
}

function spawnWith(handler: Handler): JudgeSpawn {
  return () => new FakeChild(handler) as unknown as ChildProcessWithoutNullStreams
}

function helloResult(
  request: FakeRequest,
  protocolVersion = JUDGE_PROTOCOL_VERSION,
): Record<string, unknown> {
  return {
    id: request.id,
    ok: true,
    result: {
      name: 'base-case-judge',
      version: 'test',
      os: 'test',
      arch: 'test',
      protocolVersion,
    },
  }
}

async function until(predicate: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (predicate()) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 5))
  }

  throw new Error('Condition was not met before the test timed out.')
}

const runParams = {
  problemId: 'core/pair-sum',
  language: 'python',
  code: '',
  mode: 'sample',
} as unknown as JudgeRunParams

describe('JudgeClient', () => {
  it('accepts the current protocol version only', () => {
    expect(isSupportedProtocolVersion(JUDGE_PROTOCOL_VERSION)).toBe(true)
    expect(isSupportedProtocolVersion(JUDGE_PROTOCOL_VERSION + 1)).toBe(false)
    expect(isSupportedProtocolVersion(undefined)).toBe(false)
  })

  it('rejects a sidecar that speaks a different protocol version', async () => {
    const client = new JudgeClient({
      path: 'fake-judge',
      spawnProcess: spawnWith((request, respond) => {
        if (request.method === 'hello') {
          respond(helloResult(request, JUDGE_PROTOCOL_VERSION + 1))
        }
      }),
    })

    await expect(client.run(runParams)).rejects.toMatchObject({
      code: 'protocol_version_mismatch',
    })
  })

  it('streams events without resolving the run early', async () => {
    const client = new JudgeClient({
      path: 'fake-judge',
      spawnProcess: spawnWith((request, respond) => {
        if (request.method === 'hello') {
          respond(helloResult(request))
          return
        }

        if (request.method === 'run') {
          respond({
            id: request.id,
            event: 'test_result',
            ok: true,
            result: { index: 0, status: 'accepted', runtimeMs: 4 },
          })
          respond({
            id: request.id,
            ok: true,
            result: { status: 'accepted', passed: 1, total: 1 },
          })
        }
      }),
    })

    const events: JudgeEvent[] = []
    const result = await client.run(runParams, {
      requestId: 'run-1',
      onEvent: (event) => events.push(event),
    })

    expect(events).toHaveLength(1)
    expect(events[0]?.event).toBe('test_result')
    expect(result).toMatchObject({ status: 'accepted', passed: 1, total: 1 })
  })

  it('cancels an in-flight run by request id', async () => {
    let runId = ''

    const client = new JudgeClient({
      path: 'fake-judge',
      spawnProcess: spawnWith((request, respond) => {
        if (request.method === 'hello') {
          respond(helloResult(request))
          return
        }

        if (request.method === 'run') {
          runId = request.id
          return
        }

        if (request.method === 'cancel') {
          const targetId = request.params?.targetId
          respond({
            id: request.id,
            ok: true,
            result: { cancelled: targetId === runId, targetId },
          })
          respond({
            id: runId,
            ok: true,
            result: { status: 'cancelled', passed: 0, total: 1 },
          })
        }
      }),
    })

    const runPromise = client.run(runParams, { requestId: 'run-1' })
    await until(() => runId === 'run-1')

    await expect(client.cancel('run-1')).resolves.toBe(true)
    await expect(runPromise).resolves.toMatchObject({ status: 'cancelled' })
  })

  it('returns false when cancelling without a running sidecar', async () => {
    const client = new JudgeClient({
      path: 'fake-judge',
      spawnProcess: spawnWith(() => {}),
    })

    await expect(client.cancel('run-1')).resolves.toBe(false)
  })

  it('performs the handshake once across status and run', async () => {
    let hellos = 0

    const client = new JudgeClient({
      path: 'fake-judge',
      spawnProcess: spawnWith((request, respond) => {
        if (request.method === 'hello') {
          hellos += 1
          respond(helloResult(request))
          return
        }

        if (request.method === 'doctor') {
          respond({ id: request.id, ok: true, result: {} })
          return
        }

        if (request.method === 'run') {
          respond({
            id: request.id,
            ok: true,
            result: { status: 'accepted', passed: 1, total: 1 },
          })
        }
      }),
    })

    await expect(client.status()).resolves.toMatchObject({ ok: true })
    await expect(client.run(runParams)).resolves.toMatchObject({ status: 'accepted' })
    expect(hellos).toBe(1)
  })
})
