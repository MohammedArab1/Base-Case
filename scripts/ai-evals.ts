import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildContext, estimateTokens } from '../apps/desktop/src/main/ai-context'
import { applyGuardrails } from '../apps/desktop/src/main/ai-guardrails'
import { MockProvider } from '../apps/desktop/src/main/ai-providers/mock'
import { OpenAiCompatibleProvider } from '../apps/desktop/src/main/ai-providers/openai-compatible'
import type { AiProvider } from '../apps/desktop/src/main/ai-providers/types'
import { aiJsonSchema, parseStructuredOutput } from '../apps/desktop/src/main/ai-schemas'
import type { ContentRepository } from '../apps/desktop/src/main/content'
import type { AiContext, AiFeature, Failure } from '../apps/desktop/src/shared/types'

interface ZooFailure {
  readonly status: string
  readonly input: unknown
  readonly expected: unknown
  readonly actual: unknown
  readonly stderr?: string
  readonly error?: {
    readonly type: string
    readonly message: string
    readonly stack: string
  }
}

interface ZooSolution {
  readonly id: string
  readonly bugLabel: string
  readonly code: string
  readonly failure: ZooFailure
}

interface ZooProblem {
  readonly id: string
  readonly title: string
  readonly statement: string
  readonly signature: string
  readonly patterns: readonly string[]
  readonly solutions: readonly ZooSolution[]
}

interface BugZoo {
  readonly version: number
  readonly problems: readonly ZooProblem[]
}

interface EvalCase {
  readonly problemId: string
  readonly solutionId: string
  readonly bugLabel: string
  readonly feature: AiFeature
  readonly labelMatch: boolean | null
  readonly rawLeak: boolean
  readonly guardedLeak: boolean
  readonly warning: string | null
  readonly latencyMs: number
  readonly inputTokens: number
  readonly outputTokens: number
  readonly droppedSections: readonly string[]
  readonly rawResponse: string
  readonly guardedResponse: string
  readonly helpfulness: null
  readonly diagnosisCorrect: null
}

const features: readonly AiFeature[] = ['explain', 'hint']

function headersFromEnvironment(): Readonly<Record<string, string>> | undefined {
  const raw = process.env.BASE_CASE_EVAL_HEADERS?.trim()

  if (!raw) {
    return undefined
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(
      'BASE_CASE_EVAL_HEADERS must be a JSON object whose values are strings, for example {"x-opencode-session":"..."}.',
    )
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(
      'BASE_CASE_EVAL_HEADERS must be a JSON object of header names to string values.',
    )
  }

  const headers: Record<string, string> = {}

  for (const [name, value] of Object.entries(parsed)) {
    if (name.trim().length === 0 || typeof value !== 'string') {
      throw new Error(
        'BASE_CASE_EVAL_HEADERS must contain only non-empty header names and string values.',
      )
    }

    headers[name] = value
  }

  return headers
}

function providerFromEnvironment(): AiProvider {
  const kind = process.env.BASE_CASE_EVAL_PROVIDER ?? 'mock'

  if (kind === 'mock') {
    return new MockProvider(8192)
  }

  if (kind === 'openai-compatible') {
    const baseUrl = process.env.BASE_CASE_EVAL_BASE_URL
    const model = process.env.BASE_CASE_EVAL_MODEL

    if (!baseUrl || !model) {
      throw new Error(
        'Set BASE_CASE_EVAL_BASE_URL and BASE_CASE_EVAL_MODEL for an OpenAI-compatible eval run.',
      )
    }

    return new OpenAiCompatibleProvider({
      baseUrl,
      model,
      apiKey: process.env.BASE_CASE_EVAL_API_KEY ?? '',
      contextWindow: Number(process.env.BASE_CASE_EVAL_CONTEXT_WINDOW ?? 32768),
      headers: headersFromEnvironment(),
    })
  }

  throw new Error(`Unknown BASE_CASE_EVAL_PROVIDER: ${kind}`)
}

function contentFor(problem: ZooProblem): ContentRepository {
  return {
    getProblem: (problemId: string) => {
      if (problemId !== problem.id) {
        throw new Error(`Unknown problem: ${problemId}`)
      }

      return {
        id: problem.id,
        slug: problem.id,
        title: problem.title,
        difficulty: 'medium',
        patterns: problem.patterns,
        packId: 'eval',
        packName: 'Bug zoo',
        source: 'bundled',
        statement: problem.statement,
        languageTemplates: { python: problem.signature, typescript: problem.signature },
        hints: [],
        testCounts: { sample: 1, hidden: 0 },
        commonMistakes: [],
        followUps: [],
      }
    },
  } as unknown as ContentRepository
}

function failureFor(solution: ZooSolution): Failure {
  return {
    index: 0,
    isSample: true,
    status: solution.failure.status,
    input: solution.failure.input,
    expected: solution.failure.expected,
    actual: solution.failure.actual,
    userStdout: '',
    userStderr: solution.failure.stderr ?? '',
    runtimeMs: 3,
    memoryBytes: 1024,
    ...(solution.failure.error
      ? {
          error: {
            type: solution.failure.error.type,
            message: solution.failure.error.message,
            stack: solution.failure.error.stack,
            userLine: 0,
          },
        }
      : {}),
  }
}

/**
 * Heuristic leak check that works on both raw text and JSON strings. A fenced
 * block with more than eight lines (or a very long payload) counts as a leak.
 */
function hasLongCodeBlock(text: string): boolean {
  const fence = text.indexOf('```')

  if (fence === -1) {
    return false
  }

  const after = text.slice(fence)
  const escapedNewlines = (after.match(/\\n/g) ?? []).length
  const realNewlines = (after.match(/\n/g) ?? []).length

  return escapedNewlines > 8 || realNewlines > 8 || after.length > 700
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0
  }

  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
}

async function main(): Promise<void> {
  const root = process.cwd()
  const zoo = JSON.parse(await readFile(join(root, 'docs/evals/bug-zoo.json'), 'utf8')) as BugZoo
  const provider = providerFromEnvironment()
  const cases: EvalCase[] = []

  for (const problem of zoo.problems) {
    const content = contentFor(problem)

    for (const solution of problem.solutions) {
      for (const feature of features) {
        const context: AiContext = {
          problemId: problem.id,
          language: 'python',
          code: solution.code,
          failure: failureFor(solution),
          hintLevel: feature === 'hint' ? 2 : undefined,
        }
        const built = buildContext(
          { feature, context },
          { content, contextWindow: provider.contextWindow },
        )

        const started = performance.now()
        let raw = ''

        await provider.stream(
          {
            requestId: `${solution.id}-${feature}`,
            feature,
            system: built.system,
            messages: built.messages,
            maxOutputTokens: built.preview.maxOutputTokens,
            temperature: 0.2,
            jsonSchema: aiJsonSchema(feature),
          },
          (chunk) => {
            raw += chunk
          },
        )

        const latencyMs = Math.round(performance.now() - started)
        const parsed = parseStructuredOutput(feature, raw)
        const guarded = applyGuardrails(parsed.text, parsed.result, {
          feature,
          hintLevel: built.hintLevel,
        })
        const bugType = parsed.result && 'bugType' in parsed.result ? parsed.result.bugType : null

        cases.push({
          problemId: problem.id,
          solutionId: solution.id,
          bugLabel: solution.bugLabel,
          feature,
          labelMatch: feature === 'explain' && bugType ? bugType === solution.bugLabel : null,
          rawLeak: hasLongCodeBlock(raw),
          guardedLeak: hasLongCodeBlock(guarded.text),
          warning: guarded.warnings.length > 0 ? guarded.warnings.join(' ') : null,
          latencyMs,
          inputTokens: built.preview.estimatedTokens,
          outputTokens: estimateTokens(raw),
          droppedSections: built.preview.droppedSections,
          rawResponse: raw,
          guardedResponse: guarded.text,
          helpfulness: null,
          diagnosisCorrect: null,
        })
      }
    }
  }

  const explainCases = cases.filter((entry) => entry.feature === 'explain')
  const labelMatches = explainCases.filter((entry) => entry.labelMatch === true).length
  const summary = {
    provider: provider.id,
    model: process.env.BASE_CASE_EVAL_MODEL ?? provider.name,
    endpoint: process.env.BASE_CASE_EVAL_BASE_URL ?? null,
    revision: process.env.BASE_CASE_EVAL_REVISION ?? null,
    customHeaders: Boolean(process.env.BASE_CASE_EVAL_HEADERS?.trim()),
    problems: zoo.problems.length,
    solutions: zoo.problems.reduce((sum, problem) => sum + problem.solutions.length, 0),
    cases: cases.length,
    explainLabelMatches: labelMatches,
    explainLabelAccuracy: Math.round((labelMatches / explainCases.length) * 1000) / 10,
    rawLeaks: cases.filter((entry) => entry.rawLeak).length,
    guardedLeaks: cases.filter((entry) => entry.guardedLeak).length,
    warnings: cases.filter((entry) => entry.warning !== null).length,
    averageLatencyMs: average(cases.map((entry) => entry.latencyMs)),
    averageInputTokens: average(cases.map((entry) => entry.inputTokens)),
    averageOutputTokens: average(cases.map((entry) => entry.outputTokens)),
  }

  const output = {
    generatedAt: new Date().toISOString(),
    provider: provider.id,
    summary,
    cases,
  }
  const target = join(root, `docs/evals/results-${provider.id}.json`)

  await writeFile(target, `${JSON.stringify(output, null, 2)}\n`, 'utf8')

  console.log('AI evals complete')
  console.table(summary)
  console.log(`Wrote ${target}`)
  console.log(
    'Human-rated diagnosis correctness and helpfulness are left null; fill them in after reviewing the cases.',
  )
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
