import { describe, expect, it } from 'vitest'
import { emptyDesignNotes } from '../shared/types'
import { aiRequestSchema } from './ipc-schemas'

const design = {
  scenarioId: 'core/url-shortener',
  notes: { ...emptyDesignNotes },
}

describe('aiRequestSchema', () => {
  it('accepts a design request with an unscored rubric', () => {
    const result = aiRequestSchema.safeParse({
      feature: 'designNotes',
      design: {
        ...design,
        rubric: { requirements: { score: 0, evidence: '' } },
      },
    })

    expect(result.success).toBe(true)
  })

  it('accepts a hint request with prior hints and a question', () => {
    const result = aiRequestSchema.safeParse({
      feature: 'hint',
      context: {
        problemId: 'core/pair-sum',
        language: 'python',
        code: 'def pair_sum(): pass',
        hintLevel: 2,
        priorHints: ['You are scanning every pair.'],
        question: 'What should I store?',
      },
    })

    expect(result.success).toBe(true)
  })

  it('rejects a hint level outside 1-4', () => {
    const result = aiRequestSchema.safeParse({
      feature: 'hint',
      context: {
        problemId: 'core/pair-sum',
        language: 'python',
        code: 'x',
        hintLevel: 5,
      },
    })

    expect(result.success).toBe(false)
  })

  it('rejects a design feature carrying a coding context', () => {
    const result = aiRequestSchema.safeParse({
      feature: 'followUp',
      context: {
        problemId: 'core/pair-sum',
        language: 'python',
        code: 'x',
      },
    })

    expect(result.success).toBe(false)
  })
})
