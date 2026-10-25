import { describe, expect, it } from 'vitest'
import { emptyDesignNotes } from '../shared/types'
import type { DesignAttemptDetail, DesignScenarioDetail } from '../shared/types'
import { renderDesignAttemptMarkdown } from './design-export'

const scenario: DesignScenarioDetail = {
  id: 'core/url-shortener',
  slug: 'url-shortener',
  title: 'URL Shortener',
  difficulty: 'medium',
  tags: ['api-design', 'caching'],
  packId: 'core',
  packName: 'Core Interview Pack',
  source: 'bundled',
  prompt: 'Design a URL shortener.',
  requirements: { functional: ['Create'], nonFunctional: ['Fast'] },
  scale: { writesPerDay: 10_000_000, readsPerDay: 1_000_000_000, retentionYears: 5 },
  rubric: [
    {
      id: 'requirements',
      name: 'Requirements',
      description: 'Clarifies scope.',
      levels: { '1': 'Low', '2': 'Some', '3': 'Good', '4': 'Great' },
    },
    {
      id: 'api',
      name: 'API',
      description: 'Defines endpoints.',
      levels: { '1': 'Low', '2': 'Some', '3': 'Good', '4': 'Great' },
    },
  ],
  checklist: ['API', 'Data model'],
  reference: { markdown: '# Reference design\n\nUse a cache.', sceneJson: null },
  followUps: [],
  commonMistakes: [],
}

const attempt: DesignAttemptDetail = {
  id: '00000000-0000-4000-8000-000000000001',
  scenarioId: scenario.id,
  status: 'submitted',
  averageScore: 3.5,
  createdAt: '2026-10-25T10:00:00.000Z',
  updatedAt: '2026-10-25T10:00:00.000Z',
  sceneJson: '{"elements":[]}',
  notes: { ...emptyDesignNotes, requirements: 'Writes: 10M/day.', api: 'POST /links' },
  rubric: {
    requirements: { score: 3, evidence: 'Covered | scope' },
    api: { score: 4, evidence: 'Idempotent' },
  },
}

describe('renderDesignAttemptMarkdown', () => {
  it('renders the prompt, notes, scores, and reference', () => {
    const markdown = renderDesignAttemptMarkdown(scenario, attempt)

    expect(markdown).toContain('# URL Shortener — design attempt')
    expect(markdown).toContain('Self-assessment: 3.5 / 4')
    expect(markdown).toContain('### Requirements')
    expect(markdown).toContain('Writes: 10M/day.')
    expect(markdown).toContain('| Requirements | 3 | Covered \\| scope |')
    expect(markdown).toContain('| API | 4 | Idempotent |')
    expect(markdown).toContain('# Reference design')
    expect(markdown).toContain('Use a cache.')
  })

  it('marks empty note sections explicitly', () => {
    const markdown = renderDesignAttemptMarkdown(scenario, {
      ...attempt,
      notes: { ...emptyDesignNotes },
    })

    expect(markdown).toContain('_Not filled in._')
  })
})
