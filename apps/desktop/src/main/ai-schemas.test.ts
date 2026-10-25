import { describe, expect, it } from 'vitest'
import { aiJsonSchema, parseStructuredOutput } from './ai-schemas'

const validExplain = JSON.stringify({
  summary: 'The loop stops early.',
  bugType: 'off_by_one',
  evidence: 'Line 4 excludes the last index.',
  line: 4,
  nextQuestion: 'What is the last index?',
  confidence: 'high',
})

describe('parseStructuredOutput', () => {
  it('parses a valid response', () => {
    const parsed = parseStructuredOutput('explain', validExplain)
    expect(parsed.ok).toBe(true)
    expect(parsed.result).toMatchObject({ bugType: 'off_by_one', line: 4 })
  })

  it('accepts JSON wrapped in a markdown fence', () => {
    const parsed = parseStructuredOutput('explain', `\`\`\`json\n${validExplain}\n\`\`\``)
    expect(parsed.ok).toBe(true)
  })

  it('extracts JSON surrounded by prose', () => {
    const parsed = parseStructuredOutput(
      'explain',
      `Here you go:\n${validExplain}\nHope that helps.`,
    )
    expect(parsed.ok).toBe(true)
  })

  it('rejects JSON that misses the contract', () => {
    const parsed = parseStructuredOutput('explain', JSON.stringify({ summary: 'x' }))
    expect(parsed.ok).toBe(false)
    expect(parsed.error).toContain('did not match')
  })

  it('rejects an out-of-range reveal level', () => {
    const parsed = parseStructuredOutput(
      'hint',
      JSON.stringify({
        observation: 'a',
        insight: 'b',
        nextStep: 'c',
        concept: 'd',
        revealLevel: 5,
      }),
    )
    expect(parsed.ok).toBe(false)
  })

  it('parses mistake tag suggestions and rejects unknown tags', () => {
    const parsed = parseStructuredOutput(
      'mistakeTags',
      JSON.stringify({
        suggestions: [{ tagId: 'off-by-one', reason: 'The loop excludes the last index.' }],
      }),
    )
    expect(parsed.ok).toBe(true)
    expect(parsed.result).toMatchObject({ suggestions: [{ tagId: 'off-by-one' }] })

    const unknown = parseStructuredOutput(
      'mistakeTags',
      JSON.stringify({ suggestions: [{ tagId: 'made-up-tag', reason: 'Nope.' }] }),
    )
    expect(unknown.ok).toBe(false)
  })

  it('accepts an empty mistake tag suggestion list', () => {
    const parsed = parseStructuredOutput('mistakeTags', JSON.stringify({ suggestions: [] }))
    expect(parsed.ok).toBe(true)
  })

  it('parses an explain-back verdict', () => {
    const parsed = parseStructuredOutput(
      'explainBack',
      JSON.stringify({
        verdict: 'partial',
        strengths: ['Names the hash map.'],
        gaps: ['Does not explain the complexity.'],
        nextQuestion: 'What is the cost of each lookup?',
      }),
    )
    expect(parsed.ok).toBe(true)
    expect(parsed.result).toMatchObject({ verdict: 'partial' })
  })

  it('returns the raw text when there is no JSON', () => {
    const parsed = parseStructuredOutput('followUp', 'Ask about caching.')
    expect(parsed.ok).toBe(false)
    expect(parsed.text).toBe('Ask about caching.')
  })

  it('exports a JSON schema for providers that support structured outputs', () => {
    const schema = aiJsonSchema('explain') as {
      type: string
      properties: Record<string, unknown>
    }

    expect(schema.type).toBe('object')
    expect(schema.properties).toHaveProperty('summary')
    expect(schema.properties).toHaveProperty('confidence')
  })
})
