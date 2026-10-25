import { z } from 'zod'
import type { AiFeature, AiStructuredResult } from '../shared/types'

const confidence = z.enum(['low', 'medium', 'high'])
const shortText = z.string().min(1).max(600)
const paragraph = z.string().min(1).max(4000)

const explainSchema = z.object({
  summary: shortText,
  bugType: z.string().min(1).max(100),
  evidence: paragraph,
  line: z.number().int().nonnegative().nullable(),
  nextQuestion: shortText,
  confidence,
})

const hintSchema = z.object({
  observation: paragraph,
  insight: paragraph,
  nextStep: paragraph,
  concept: z.string().min(1).max(100),
  revealLevel: z.number().int().min(1).max(4),
})

const approachSchema = z.object({
  matchesIntendedPattern: z.boolean(),
  strengths: z.array(z.string().max(1000)).max(8),
  risks: z.array(z.string().max(1000)).max(8),
  suggestedQuestion: shortText,
})

const complexitySchema = z.object({
  time: z.string().min(1).max(100),
  space: z.string().min(1).max(100),
  reasoning: paragraph,
  confidence,
})

const designDimensionSchema = z.object({
  name: z.string().min(1).max(200),
  score: z.number().int().min(1).max(4),
  evidence: paragraph,
  nextStep: z.string().min(1).max(1000),
})

const designNotesSchema = z.object({
  dimensions: z.array(designDimensionSchema).min(1).max(12),
  strengths: z.array(z.string().max(1000)).max(10),
  gaps: z.array(z.string().max(1000)).max(10),
  followUpQuestions: z.array(z.string().max(1000)).max(8),
})

const followUpSchema = z.object({
  question: z.string().min(1).max(1000),
})

export const aiOutputSchemas = {
  explain: explainSchema,
  hint: hintSchema,
  approach: approachSchema,
  complexity: complexitySchema,
  designNotes: designNotesSchema,
  followUp: followUpSchema,
} satisfies Record<AiFeature, z.ZodTypeAny>

/** JSON Schema for providers that implement structured outputs. */
export function aiJsonSchema(feature: AiFeature): unknown {
  return z.toJSONSchema(aiOutputSchemas[feature])
}

export interface ParsedAiOutput {
  readonly ok: boolean
  readonly result?: AiStructuredResult
  readonly text: string
  readonly error?: string
}

function extractJsonObject(raw: string): string | null {
  const trimmed = raw.trim()
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed)
  const body = fenced?.[1] ?? trimmed
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')

  if (start === -1 || end === -1 || end <= start) {
    return null
  }

  return body.slice(start, end + 1)
}

/**
 * Parses a model response against the feature's contract. A failure is a
 * normal outcome: the caller shows the raw text with a warning instead.
 */
export function parseStructuredOutput(feature: AiFeature, raw: string): ParsedAiOutput {
  const candidate = extractJsonObject(raw)

  if (!candidate) {
    return {
      ok: false,
      text: raw,
      error: 'The model did not return a JSON object.',
    }
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(candidate)
  } catch {
    return {
      ok: false,
      text: raw,
      error: 'The model returned JSON that could not be parsed.',
    }
  }

  const validated = aiOutputSchemas[feature].safeParse(parsed)

  if (!validated.success) {
    const issues = validated.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join('.') || 'response'}: ${issue.message}`)
      .join('; ')

    return {
      ok: false,
      text: raw,
      error: `The model returned JSON that did not match the ${feature} contract (${issues}).`,
    }
  }

  return {
    ok: true,
    result: validated.data as AiStructuredResult,
    text: JSON.stringify(validated.data),
  }
}
