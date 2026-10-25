import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { RunResult } from '../../shared/types'
import { AppDatabase } from '../database'
import { AttemptsRepository } from './attempts'

function withAttempts(run: (attempts: AttemptsRepository) => void): void {
  const directory = mkdtempSync(join(tmpdir(), 'base-case-attempts-'))
  const database = new AppDatabase(directory)

  try {
    run(new AttemptsRepository(database))
  } finally {
    database.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

function result(status: string, passed: number, total: number): RunResult {
  return { status, passed, total } as RunResult
}

describe('AttemptsRepository', () => {
  it('persists attempts and summarizes them', () => {
    withAttempts((attempts) => {
      const first = attempts.save({
        problemId: 'core/pair-sum',
        language: 'python',
        mode: 'sample',
        code: 'pass',
        result: result('wrong_answer', 2, 5),
      })
      const second = attempts.save({
        problemId: 'core/pair-sum',
        language: 'python',
        mode: 'submit',
        code: 'return []',
        result: result('accepted', 39, 39),
      })

      expect(first).not.toBe(second)

      const stats = attempts.getStats()
      expect(stats.attempts).toBe(2)
      expect(stats.accepted).toBe(1)
      expect(stats.lastAttemptAt).toEqual(expect.any(String))
    })
  })

  it('returns zeroes before any attempt', () => {
    withAttempts((attempts) => {
      expect(attempts.getStats()).toEqual({
        attempts: 0,
        accepted: 0,
        lastAttemptAt: null,
      })
    })
  })
})
