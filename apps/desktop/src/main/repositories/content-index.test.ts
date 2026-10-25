import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AppDatabase } from '../database'
import { ContentIndexRepository } from './content-index'

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

function withIndex(run: (index: ContentIndexRepository) => void): void {
  const directory = mkdtempSync(join(tmpdir(), 'base-case-content-index-'))
  const database = new AppDatabase(directory)

  try {
    run(new ContentIndexRepository(database))
  } finally {
    database.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

describe('ContentIndexRepository', () => {
  it('finds problems by title, pattern, and body text', () => {
    withIndex((index) => {
      index.replace(rows)

      expect(index.search('hash')).toEqual(['core/pair-sum'])
      expect(index.search('linked list')).toEqual(['core/reverse-list'])
      expect(index.search('pointers')).toEqual(['core/reverse-list'])
    })
  })

  it('supports prefix matches while typing', () => {
    withIndex((index) => {
      index.replace(rows)
      expect(index.search('pai')).toEqual(['core/pair-sum'])
    })
  })

  it('replaces the index instead of duplicating rows', () => {
    withIndex((index) => {
      index.replace(rows)
      index.replace(rows.slice(0, 1))

      expect(index.search('linked')).toEqual([])
      expect(index.search('pair')).toEqual(['core/pair-sum'])
    })
  })

  it('returns no results for blank or punctuation-only queries', () => {
    withIndex((index) => {
      index.replace(rows)

      expect(index.search('')).toEqual([])
      expect(index.search('   ')).toEqual([])
      expect(index.search('"')).toEqual([])
    })
  })
})
