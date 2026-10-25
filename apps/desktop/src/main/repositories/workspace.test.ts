import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AppDatabase } from '../database'
import { DesignRepository } from './design'
import { DraftsRepository } from './drafts'

function withDatabase(run: (database: AppDatabase) => void): void {
  const directory = mkdtempSync(join(tmpdir(), 'base-case-workspace-'))
  const database = new AppDatabase(directory)

  try {
    run(database)
  } finally {
    database.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

describe('DraftsRepository', () => {
  it('round-trips a draft per problem and language', () => {
    withDatabase((database) => {
      const drafts = new DraftsRepository(database)

      expect(drafts.get('core/pair-sum', 'python')).toBeNull()

      drafts.save('core/pair-sum', 'python', 'first')
      drafts.save('core/pair-sum', 'typescript', 'other')
      drafts.save('core/pair-sum', 'python', 'second')

      expect(drafts.get('core/pair-sum', 'python')).toBe('second')
      expect(drafts.get('core/pair-sum', 'typescript')).toBe('other')
    })
  })
})

describe('DesignRepository', () => {
  it('round-trips the sandbox scene', () => {
    withDatabase((database) => {
      const design = new DesignRepository(database)

      expect(design.getScene()).toEqual({ sceneJson: null, updatedAt: null })

      design.saveScene('{"type":"excalidraw"}')

      const saved = design.getScene()
      expect(saved.sceneJson).toBe('{"type":"excalidraw"}')
      expect(saved.updatedAt).toEqual(expect.any(String))
    })
  })
})
