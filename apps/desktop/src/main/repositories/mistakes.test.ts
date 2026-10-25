import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { RunResult } from '../../shared/types'
import { AppDatabase } from '../database'
import { AttemptsRepository } from './attempts'
import { MistakesRepository, seedMistakeTags } from './mistakes'

function withRepositories(
  run: (attempts: AttemptsRepository, mistakes: MistakesRepository) => void,
): void {
  const directory = mkdtempSync(join(tmpdir(), 'base-case-mistakes-'))
  const database = new AppDatabase(directory)

  try {
    run(new AttemptsRepository(database), new MistakesRepository(database))
  } finally {
    database.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

function saveAttempt(attempts: AttemptsRepository): string {
  return attempts.save({
    problemId: 'core/pair-sum',
    language: 'python',
    mode: 'submit',
    code: 'return []',
    result: { status: 'wrong_answer', passed: 2, total: 5 } as RunResult,
  })
}

describe('MistakesRepository', () => {
  it('seeds the default taxonomy once', () => {
    withRepositories((_attempts, mistakes) => {
      expect(mistakes.list()).toHaveLength(seedMistakeTags.length)
      expect(mistakes.list().map((tag) => tag.id)).toContain('off-by-one')
    })
  })

  it('replaces the tags on an attempt', () => {
    withRepositories((attempts, mistakes) => {
      const attemptId = saveAttempt(attempts)

      expect(mistakes.tagAttempt(attemptId, ['off-by-one', 'missed-edge-case'])).toEqual([
        'missed-edge-case',
        'off-by-one',
      ])

      expect(mistakes.tagAttempt(attemptId, ['wrong-complexity'])).toEqual(['wrong-complexity'])
      expect(mistakes.listForAttempt(attemptId)).toEqual(['wrong-complexity'])
    })
  })

  it('counts tagged attempts', () => {
    withRepositories((attempts, mistakes) => {
      const first = saveAttempt(attempts)
      const second = saveAttempt(attempts)

      mistakes.tagAttempt(first, ['off-by-one'])
      mistakes.tagAttempt(second, ['off-by-one', 'syntax'])

      expect(mistakes.counts()).toEqual([
        { tagId: 'off-by-one', label: 'Off-by-one', count: 2 },
        { tagId: 'syntax', label: 'Syntax or API', count: 1 },
      ])
    })
  })

  it('rolls back when a tag is unknown', () => {
    withRepositories((attempts, mistakes) => {
      const attemptId = saveAttempt(attempts)
      mistakes.tagAttempt(attemptId, ['off-by-one'])

      expect(() => mistakes.tagAttempt(attemptId, ['off-by-one', 'not-a-tag'])).toThrow(
        /Unknown mistake tag/,
      )
      expect(mistakes.listForAttempt(attemptId)).toEqual(['off-by-one'])
    })
  })
})
