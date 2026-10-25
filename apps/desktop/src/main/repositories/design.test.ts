import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { emptyDesignNotes } from '../../shared/types'
import type { DesignNotes, DesignRubricAnswers } from '../../shared/types'
import { AppDatabase } from '../database'
import { DesignRepository } from './design'

function withDesign(run: (design: DesignRepository) => void): void {
  const directory = mkdtempSync(join(tmpdir(), 'base-case-design-'))
  const database = new AppDatabase(directory)

  try {
    run(new DesignRepository(database))
  } finally {
    database.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

const scenarioId = 'core/url-shortener'

const notes: DesignNotes = {
  ...emptyDesignNotes,
  requirements: '10M writes/day, 1B reads/day, 5-year retention.',
  api: 'POST /v1/links and GET /:code.',
}

const rubric: DesignRubricAnswers = {
  requirements: { score: 3, evidence: 'Separated functional and non-functional requirements.' },
  api: { score: 4, evidence: 'Covered idempotency and expiry.' },
}

describe('DesignRepository', () => {
  it('returns an empty draft before the first save', () => {
    withDesign((design) => {
      expect(design.getDraft(scenarioId)).toEqual({
        scenarioId,
        sceneJson: '',
        notes: emptyDesignNotes,
        rubric: {},
        updatedAt: null,
      })
    })
  })

  it('merges partial draft saves', () => {
    withDesign((design) => {
      design.saveDraft({ scenarioId, sceneJson: '{"elements":[]}' })

      const afterScene = design.getDraft(scenarioId)
      expect(afterScene.sceneJson).toBe('{"elements":[]}')
      expect(afterScene.notes).toEqual(emptyDesignNotes)

      design.saveDraft({ scenarioId, notes, rubric })

      const merged = design.getDraft(scenarioId)
      expect(merged.sceneJson).toBe('{"elements":[]}')
      expect(merged.notes).toEqual(notes)
      expect(merged.rubric).toEqual(rubric)
      expect(merged.updatedAt).toEqual(expect.any(String))
    })
  })

  it('submits snapshots and lists them newest first', () => {
    withDesign((design) => {
      const first = design.submit({ scenarioId, sceneJson: '', notes, rubric })

      expect(first.averageScore).toBe(3.5)
      expect(design.listAttempts(scenarioId)).toHaveLength(1)

      const second = design.submit({
        scenarioId,
        sceneJson: '{"elements":[]}',
        notes,
        rubric: { requirements: { score: 4, evidence: 'Better.' } },
      })

      const attempts = design.listAttempts(scenarioId)
      expect(attempts).toHaveLength(2)
      expect(attempts[0]?.id).toBe(second.id)
      expect(attempts[1]?.id).toBe(first.id)
      expect(attempts[0]?.averageScore).toBe(4)

      const detail = design.getAttempt(second.id)
      expect(detail.sceneJson).toBe('{"elements":[]}')
      expect(detail.notes).toEqual(notes)
      expect(detail.rubric).toEqual({ requirements: { score: 4, evidence: 'Better.' } })
    })
  })

  it('does not list drafts as attempts', () => {
    withDesign((design) => {
      design.saveDraft({ scenarioId, sceneJson: '{"elements":[]}' })

      expect(design.listAttempts(scenarioId)).toEqual([])
      expect(() => design.getAttempt('00000000-0000-4000-8000-000000000001')).toThrow(/not found/)
    })
  })

  it('round-trips a scene with more than 100 elements quickly', () => {
    withDesign((design) => {
      const elements = Array.from({ length: 150 }, (_, index) => ({
        id: `element-${index}`,
        type: 'rectangle',
        x: index * 10,
        y: index * 5,
        width: 40,
        height: 30,
      }))
      const sceneJson = JSON.stringify({
        type: 'excalidraw',
        version: 2,
        elements,
        appState: { viewBackgroundColor: '#ffffff' },
        files: {},
      })

      const started = Date.now()
      design.saveDraft({ scenarioId, sceneJson })
      const loaded = design.getDraft(scenarioId)
      const elapsed = Date.now() - started

      expect(loaded.sceneJson).toBe(sceneJson)
      expect((JSON.parse(loaded.sceneJson) as { elements: unknown[] }).elements).toHaveLength(150)
      expect(elapsed).toBeLessThan(1000)
    })
  })
})
