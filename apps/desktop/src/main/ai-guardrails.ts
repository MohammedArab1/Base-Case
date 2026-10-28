import type { AiFeature, AiStructuredResult } from '../shared/types'

const outputLimits: Record<AiFeature, number> = {
  explain: 2000,
  hint: 1800,
  approach: 2200,
  complexity: 1400,
  mistakeTags: 1200,
  explainBack: 1600,
  designNotes: 6000,
  followUp: 900,
  concept: 3200,
}

const codeBlockLineLimits: Record<AiFeature, number> = {
  explain: 6,
  hint: 6,
  approach: 10,
  complexity: 10,
  mistakeTags: 4,
  explainBack: 6,
  designNotes: 14,
  followUp: 14,
  concept: 8,
}

export interface GuardrailOptions {
  readonly feature: AiFeature
  readonly hintLevel: number
}

export interface GuardrailResult {
  readonly text: string
  readonly result?: AiStructuredResult
  readonly warnings: readonly string[]
}

interface StrippedText {
  readonly text: string
  readonly removed: number
}

function stripLongCodeBlocks(value: string, maxLines: number): StrippedText {
  let removed = 0
  const text = value.replace(/```[^\n]*\n([\s\S]*?)```/g, (match, body: string) => {
    const lineCount = body.split('\n').length

    if (lineCount > maxLines || body.length > 700) {
      removed += 1
      return '[long code block removed to avoid revealing a solution]'
    }

    return match
  })

  const unfenced = stripUnfencedCode(text, maxLines)

  return { text: unfenced.text, removed: removed + unfenced.removed }
}

const codeLinePattern =
  /^\s*(?:def |class |function |return |for |while |if |elif |else:|const |let |var |import |from |#include|public |private |static )/

/** Catches a full function pasted without Markdown fences. */
function stripUnfencedCode(value: string, maxLines: number): StrippedText {
  const lines = value.split('\n')
  const output: string[] = []
  let run: string[] = []
  let removed = 0

  const flush = (): void => {
    if (run.length === 0) {
      return
    }

    if (run.length > maxLines) {
      output.push('[long code removed to avoid revealing a solution]')
      removed += 1
    } else {
      output.push(...run)
    }

    run = []
  }

  for (const line of lines) {
    const isCode = codeLinePattern.test(line) || (run.length > 0 && line.trim() === '')

    if (isCode) {
      run.push(line)
    } else {
      flush()
      output.push(line)
    }
  }

  flush()

  return { text: output.join('\n'), removed }
}

function capText(
  value: string,
  maxChars: number,
): { readonly text: string; readonly trimmed: boolean } {
  if (value.length <= maxChars) {
    return { text: value, trimmed: false }
  }

  const newline = value.lastIndexOf('\n', maxChars)
  const end = newline > maxChars * 0.6 ? newline : maxChars

  return {
    text: `${value.slice(0, end).trimEnd()}\n… [trimmed to the output limit]`,
    trimmed: true,
  }
}

function mapStrings(value: unknown, transform: (input: string) => string): unknown {
  if (typeof value === 'string') {
    return transform(value)
  }

  if (Array.isArray(value)) {
    return value.map((entry) => mapStrings(entry, transform))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, mapStrings(entry, transform)]),
    )
  }

  return value
}

/**
 * Applied after parsing and before anything reaches the renderer. Long code
 * blocks are the main leak vector, so they are removed below reveal level 4.
 * The caller shows the raw response with a warning if parsing failed.
 */
export function applyGuardrails(
  raw: string,
  result: AiStructuredResult | undefined,
  options: GuardrailOptions,
): GuardrailResult {
  const warnings: string[] = []
  const maxLines =
    options.feature === 'hint' && options.hintLevel >= 4 ? 16 : codeBlockLineLimits[options.feature]

  if (!result) {
    const stripped = stripLongCodeBlocks(raw, maxLines)
    const capped = capText(stripped.text, outputLimits[options.feature])

    if (stripped.removed > 0) {
      warnings.push('A long code block was removed to avoid revealing a full solution.')
    }
    if (capped.trimmed) {
      warnings.push('The response was trimmed to the output limit.')
    }

    return { text: capped.text, warnings }
  }

  let removed = 0
  let guarded = mapStrings(result, (value) => {
    const stripped = stripLongCodeBlocks(value, maxLines)
    removed += stripped.removed
    return stripped.text
  }) as AiStructuredResult

  if (removed > 0) {
    warnings.push('A long code block was removed to avoid revealing a full solution.')
  }

  if ('revealLevel' in guarded && guarded.revealLevel > options.hintLevel) {
    guarded = { ...guarded, revealLevel: options.hintLevel }
    warnings.push('The model tried to reveal more than the requested hint level; it was clamped.')
  }

  if (
    options.feature === 'explain' &&
    'evidence' in guarded &&
    !/\b(line|test|index|input|expected|actual|loop|value|\d+)\b/i.test(guarded.evidence)
  ) {
    warnings.push(
      'The explanation did not cite a line or test value; verify it against the judge output.',
    )
  }

  return { text: JSON.stringify(guarded), result: guarded, warnings }
}
