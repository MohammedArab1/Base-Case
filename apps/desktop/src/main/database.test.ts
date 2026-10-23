import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AppDatabase } from './database'

function withDatabase(run: (database: AppDatabase) => void): void {
  const directory = mkdtempSync(join(tmpdir(), 'base-case-database-'))
  const database = new AppDatabase(directory)

  try {
    run(database)
  } finally {
    database.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

const rows = [
  {
    problemId: 'core/pair-sum',
    title: 'Pair Sum',
    patterns: 'arrays hash-map',
    packName: 'Core pack',
    body: 'Return the indices of two distinct values that add up to the target.',
  },
  {
    problemId: 'core/reverse-list',
    title: 'Reverse a Linked List',
    patterns: 'linked-list',
    packName: 'Core pack',
    body: 'Reverse the pointers of a singly linked list.',
  },
]

describe('problem search index', () => {
  it('finds problems by title, pattern, and body text', () => {
    withDatabase((database) => {
      database.replaceProblemIndex(rows)

      expect(database.searchProblemIds('hash')).toEqual(['core/pair-sum'])
      expect(database.searchProblemIds('linked list')).toEqual(['core/reverse-list'])
      expect(database.searchProblemIds('pointers')).toEqual(['core/reverse-list'])
    })
  })

  it('supports prefix matches while typing', () => {
    withDatabase((database) => {
      database.replaceProblemIndex(rows)
      expect(database.searchProblemIds('pai')).toEqual(['core/pair-sum'])
    })
  })

  it('replaces the index instead of duplicating rows', () => {
    withDatabase((database) => {
      database.replaceProblemIndex(rows)
      database.replaceProblemIndex(rows.slice(0, 1))

      expect(database.searchProblemIds('linked')).toEqual([])
      expect(database.searchProblemIds('pair')).toEqual(['core/pair-sum'])
    })
  })

  it('returns no results for blank or punctuation-only queries', () => {
    withDatabase((database) => {
      database.replaceProblemIndex(rows)

      expect(database.searchProblemIds('')).toEqual([])
      expect(database.searchProblemIds('   ')).toEqual([])
      expect(database.searchProblemIds('"')).toEqual([])
    })
  })
})
