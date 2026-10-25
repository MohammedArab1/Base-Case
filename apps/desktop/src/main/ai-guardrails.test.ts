import { describe, expect, it } from 'vitest'
import type { AiExplainResult, AiHintResult } from '../shared/types'
import { applyGuardrails } from './ai-guardrails'

const hint: AiHintResult = {
  observation: 'You scan every pair.',
  insight: 'A hash map removes the inner loop.',
  nextStep: 'Store each value as you scan.',
  concept: 'hash-map',
  revealLevel: 2,
}

const explain: AiExplainResult = {
  summary: 'The loop stops early.',
  bugType: 'off_by_one',
  evidence: 'Line 4 uses len(nums) - 1.',
  line: 4,
  nextQuestion: 'What is the last index?',
  confidence: 'high',
}

describe('applyGuardrails', () => {
  it('removes a long code block below reveal level 4', () => {
    const longBlock = `\`\`\`python\n${Array.from({ length: 12 }, (_, index) => `x${index} = 1`).join('\n')}\n\`\`\``
    const result = applyGuardrails(
      '',
      { ...hint, nextStep: `Here is the fix:\n${longBlock}` },
      { feature: 'hint', hintLevel: 2 },
    )

    expect(result.result).toBeDefined()
    expect(JSON.stringify(result.result)).not.toContain('x11 = 1')
    expect(result.warnings.join(' ')).toContain('code block')
  })

  it('removes a long unfenced code block below reveal level 4', () => {
    const code = Array.from({ length: 9 }, (_, index) =>
      index === 0 ? 'def solve(nums):' : `    return nums[${index}]`,
    ).join('\n')
    const result = applyGuardrails(
      '',
      { ...hint, nextStep: code },
      { feature: 'hint', hintLevel: 2 },
    )

    expect(JSON.stringify(result.result)).not.toContain('return nums[8]')
    expect(result.warnings.join(' ')).toContain('code block')
  })

  it('allows a longer block at reveal level 4', () => {
    const block = `\`\`\`python\n${Array.from({ length: 8 }, (_, index) => `x${index} = 1`).join('\n')}\n\`\`\``
    const result = applyGuardrails(
      '',
      { ...hint, revealLevel: 4, nextStep: block },
      { feature: 'hint', hintLevel: 4 },
    )

    expect(JSON.stringify(result.result)).toContain('x7 = 1')
    expect(result.warnings).toEqual([])
  })

  it('clamps a reveal level above the requested level', () => {
    const result = applyGuardrails(
      '',
      { ...hint, revealLevel: 4 },
      { feature: 'hint', hintLevel: 1 },
    )

    expect((result.result as AiHintResult).revealLevel).toBe(1)
    expect(result.warnings.join(' ')).toContain('clamped')
  })

  it('warns when an explanation does not cite evidence', () => {
    const result = applyGuardrails(
      '',
      { ...explain, evidence: 'The approach is wrong.' },
      { feature: 'explain', hintLevel: 1 },
    )

    expect(result.warnings.join(' ')).toContain('did not cite')
  })

  it('accepts a cited explanation without warnings', () => {
    const result = applyGuardrails('', explain, { feature: 'explain', hintLevel: 1 })
    expect(result.warnings).toEqual([])
  })

  it('caps raw text that is not valid JSON', () => {
    const result = applyGuardrails('x'.repeat(5000), undefined, {
      feature: 'followUp',
      hintLevel: 1,
    })

    expect(result.text.length).toBeLessThan(1200)
    expect(result.text).toContain('trimmed')
  })
})
