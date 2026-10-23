import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { Logger, redactForLog } from './logger'

function temporaryDirectory(): string {
  return mkdtempSync(join(tmpdir(), 'base-case-logger-'))
}

describe('redactForLog', () => {
  it('redacts sensitive keys recursively', () => {
    expect(
      redactForLog({
        apiKey: 'secret',
        nested: { token: 'secret', ok: 'keep' },
        list: [{ password: 'secret' }],
      }),
    ).toEqual({
      apiKey: '[redacted]',
      nested: { token: '[redacted]', ok: 'keep' },
      list: [{ password: '[redacted]' }],
    })
  })
})

describe('Logger', () => {
  it('writes structured JSON lines with a scope', () => {
    const directory = temporaryDirectory()

    try {
      Logger.file({ directory })
        .child('ipc')
        .info('request.completed', { channel: 'app:info', durationMs: 4 })

      const line = readFileSync(join(directory, 'app.log'), 'utf8').trim()
      const record = JSON.parse(line) as Record<string, unknown>

      expect(record.level).toBe('info')
      expect(record.scope).toBe('ipc')
      expect(record.event).toBe('request.completed')
      expect(record.channel).toBe('app:info')
      expect(typeof record.time).toBe('string')
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('rotates the log file and respects the file cap', () => {
    const directory = temporaryDirectory()

    try {
      const logger = Logger.file({ directory, maxBytes: 300, maxFiles: 2 })

      for (let index = 0; index < 20; index += 1) {
        logger.info('entry', { index, padding: 'x'.repeat(80) })
      }

      expect(existsSync(join(directory, 'app.log'))).toBe(true)
      expect(existsSync(join(directory, 'app.1.log'))).toBe(true)
      expect(existsSync(join(directory, 'app.2.log'))).toBe(true)
      expect(existsSync(join(directory, 'app.3.log'))).toBe(false)
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
