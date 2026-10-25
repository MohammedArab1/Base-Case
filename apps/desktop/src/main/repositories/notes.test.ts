import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AppDatabase } from '../database'
import { ProblemNotesRepository } from './notes'

function withNotes(run: (notes: ProblemNotesRepository) => void): void {
  const directory = mkdtempSync(join(tmpdir(), 'base-case-notes-'))
  const database = new AppDatabase(directory)

  try {
    run(new ProblemNotesRepository(database))
  } finally {
    database.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

describe('ProblemNotesRepository', () => {
  it('returns empty notes before anything is saved', () => {
    withNotes((notes) => {
      expect(notes.get('core/pair-sum')).toEqual({ notes: '', updatedAt: null })
    })
  })

  it('round-trips and updates notes per problem', () => {
    withNotes((notes) => {
      const saved = notes.save('core/pair-sum', 'Check the complement first.')
      expect(saved.notes).toBe('Check the complement first.')
      expect(saved.updatedAt).toEqual(expect.any(String))
      expect(notes.get('core/pair-sum').notes).toBe('Check the complement first.')

      notes.save('core/pair-sum', 'Updated.')
      notes.save('core/other', 'Separate note.')

      expect(notes.get('core/pair-sum').notes).toBe('Updated.')
      expect(notes.get('core/other').notes).toBe('Separate note.')
    })
  })
})
