import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { RunResult } from '../../shared/types'
import { AppDatabase } from '../database'
import { AttemptsRepository } from './attempts'
import { DraftsRepository } from './drafts'
import { MistakesRepository } from './mistakes'
import { ProblemNotesRepository } from './notes'
import { ReviewRepository } from './review'
import { SettingsRepository } from './settings'
import { UserDataRepository } from './user-data'

function withDatabase(run: (database: AppDatabase, directory: string) => void): void {
  const directory = mkdtempSync(join(tmpdir(), 'base-case-user-data-'))

  try {
    const database = new AppDatabase(directory)

    try {
      run(database, directory)
    } finally {
      database.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

describe('UserDataRepository', () => {
  it('round-trips user data into a fresh database', () => {
    let bundle: unknown = null
    let attemptId = ''

    withDatabase((source) => {
      const attempts = new AttemptsRepository(source)
      const mistakes = new MistakesRepository(source)
      const drafts = new DraftsRepository(source)
      const notes = new ProblemNotesRepository(source)
      const review = new ReviewRepository(source)
      const userData = new UserDataRepository(source)

      attemptId = attempts.save({
        problemId: 'core/pair-sum',
        language: 'python',
        mode: 'submit',
        code: 'return []',
        result: { status: 'wrong_answer', passed: 2, total: 5 } as RunResult,
        plan: 'Use a hash map.',
        hintsUsed: 1,
      })
      mistakes.tagAttempt(attemptId, ['off-by-one'])
      drafts.save('core/pair-sum', 'python', 'draft code', 'draft plan')
      notes.save('core/pair-sum', 'Remember the complement.')

      const card = review.ensureCard('problem', 'core/pair-sum')
      review.review(card.id, 'good')

      const exported = userData.export()
      bundle = JSON.parse(JSON.stringify(exported.bundle)) as unknown

      expect(exported.counts.attempts).toBe(1)
      expect(exported.counts.attempt_mistake_tags).toBe(1)
      expect(exported.counts.review_cards).toBe(1)
      expect(exported.counts.review_logs).toBe(1)
    })

    withDatabase((destination) => {
      const userData = new UserDataRepository(destination)
      const counts = userData.import(bundle)

      expect(counts.attempts).toBe(1)
      expect(counts.review_cards).toBe(1)
      expect(counts.review_logs).toBe(1)

      const attempts = new AttemptsRepository(destination)
      const detail = attempts.get(attemptId)
      expect(detail.plan).toBe('Use a hash map.')
      expect(detail.hintsUsed).toBe(1)
      expect(detail.mistakeTagIds).toEqual(['off-by-one'])

      expect(new DraftsRepository(destination).get('core/pair-sum', 'python')).toEqual({
        code: 'draft code',
        plan: 'draft plan',
      })
      expect(new ProblemNotesRepository(destination).get('core/pair-sum').notes).toBe(
        'Remember the complement.',
      )
      expect(new ReviewRepository(destination).findCard('problem', 'core/pair-sum')?.reps).toBe(1)
    })
  })

  it('excludes the encrypted API key from exports', () => {
    withDatabase((database) => {
      const settings = new SettingsRepository(database)
      settings.set('ai.apiKey', 'encrypted-blob')
      settings.set('ai.contextWindow', '8192')

      const rows = new UserDataRepository(database).export().bundle.tables.settings ?? []

      expect(rows.some((row) => row.key === 'ai.apiKey')).toBe(false)
      expect(rows.some((row) => row.key === 'ai.contextWindow')).toBe(true)
    })
  })

  it('rejects files that are not Base Case exports', () => {
    withDatabase((database) => {
      const userData = new UserDataRepository(database)

      expect(() => userData.import({ format: 'something-else' })).toThrow(
        /not a supported Base Case export/,
      )
    })
  })
})
