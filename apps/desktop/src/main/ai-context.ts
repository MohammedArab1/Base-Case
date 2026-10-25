import { designNoteSections } from '../shared/types'
import type {
  AiChatMessage,
  AiContext,
  AiContextSection,
  AiDesignContext,
  AiFeature,
  AiPreview,
  AiRequest,
  Failure,
  Language,
} from '../shared/types'
import { systemPrompt } from './ai-prompts'
import type { ContentRepository } from './content'

const outputBudget: Record<AiFeature, number> = {
  explain: 400,
  hint: 350,
  approach: 450,
  complexity: 300,
  designNotes: 1100,
  followUp: 250,
}

const sectionLabels: Record<string, string> = {
  problem_statement: 'Problem statement',
  learner_plan: 'Your plan',
  user_code: 'Your code',
  failing_test: 'First failing test',
  prior_hints: 'Prior hints',
  learner_question: 'Your question',
  scenario_brief: 'Scenario brief',
  learner_notes: 'Your design notes',
  learner_rubric: 'Your rubric self-assessment',
  conversation: 'Conversation',
}

const secretPatterns: readonly RegExp[] = [
  /\b(?:sk|rk|pk)-[A-Za-z0-9_-]{16,}\b/g,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\bBearer\s+[A-Za-z0-9._~+/-]{12,}=*/gi,
  /\b(?:api[_-]?key|apikey)\s*[:=]\s*["'][^"']{6,}["']/gi,
  /\b(?:password|passwd)\s*[:=]\s*["'][^"']{4,}["']/gi,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
]

const closingTagPattern =
  /<\/(problem_statement|user_code|failing_test|learner_plan|learner_notes|learner_rubric|learner_question|conversation)>/gi

interface RawSection {
  readonly id: string
  readonly label: string
  body: string
  tokens: number
  truncated: boolean
  dropped: boolean
}

interface RedactionCounter {
  count: number
}

export interface BuildContextOptions {
  readonly content: ContentRepository
  readonly contextWindow: number
}

export interface BuiltContext {
  readonly system: string
  readonly messages: readonly AiChatMessage[]
  readonly preview: AiPreview
  readonly hintLevel: number
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export function redactSecrets(value: string): { readonly text: string; readonly count: number } {
  let count = 0
  let text = value

  for (const pattern of secretPatterns) {
    text = text.replace(pattern, () => {
      count += 1
      return '[redacted]'
    })
  }

  return { text, count }
}

/**
 * Closing tags are escaped so learner text cannot break out of its data
 * delimiters. The escaped form stays harmless in code and notes.
 */
export function defuseTags(value: string): string {
  return value.replace(closingTagPattern, '<\\/$1>')
}

export function truncateText(
  value: string,
  maxChars: number,
): { readonly text: string; readonly truncated: boolean } {
  if (value.length <= maxChars) {
    return { text: value, truncated: false }
  }

  return {
    text: `${value.slice(0, maxChars)}\n… [truncated ${value.length - maxChars} characters]`,
    truncated: true,
  }
}

/**
 * Keeps the code around the failing line instead of sending the whole file.
 * Snap to line boundaries so the slice stays readable.
 */
export function sliceCodeAroundLine(code: string, line: number | null, maxChars: number): string {
  if (code.length <= maxChars) {
    return code
  }

  const lines = code.split('\n')
  const targetIndex =
    line !== null && line > 0 ? Math.min(lines.length - 1, Math.max(0, line - 1)) : 0

  let startIndex = targetIndex
  let endIndex = targetIndex + 1
  let length = lines[targetIndex]?.length ?? 0

  while (startIndex > 0 || endIndex < lines.length) {
    const canGrowUp = startIndex > 0
    const canGrowDown = endIndex < lines.length

    if (length >= maxChars) {
      break
    }

    const growUp = canGrowUp && (!canGrowDown || startIndex > targetIndex - 40)
    const candidate = growUp ? startIndex - 1 : endIndex

    if (candidate < 0 || candidate >= lines.length) {
      break
    }

    length += (lines[candidate]?.length ?? 0) + 1

    if (growUp) {
      startIndex = candidate
    } else {
      endIndex = candidate + 1
    }
  }

  const slice = lines.slice(startIndex, endIndex).join('\n')
  const prefix = startIndex > 0 ? `… [${startIndex} earlier lines omitted]\n` : ''
  const suffix =
    endIndex < lines.length ? `\n… [${lines.length - endIndex} later lines omitted]` : ''

  return `${prefix}${slice}${suffix}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function clean(value: string, counter: RedactionCounter): string {
  const redacted = redactSecrets(value)
  counter.count += redacted.count
  return defuseTags(redacted.text)
}

function section(
  id: string,
  body: string,
  counter: RedactionCounter,
  truncated = false,
): RawSection {
  const cleaned = clean(body, counter)
  return {
    id,
    label: sectionLabels[id] ?? id,
    body: cleaned,
    tokens: estimateTokens(cleaned),
    truncated,
    dropped: false,
  }
}

function safeJson(value: unknown, limit = 2000): string {
  return truncateText(JSON.stringify(value) ?? 'undefined', limit).text
}

function failureBody(failure: Failure): string {
  const parts = [
    `Status: ${failure.status}`,
    `Test index: ${failure.index} (${failure.isSample ? 'sample' : 'hidden'})`,
    `Input: ${safeJson(failure.input)}`,
    `Expected: ${safeJson(failure.expected)}`,
    `Actual: ${safeJson(failure.actual)}`,
    `Runtime: ${failure.runtimeMs} ms`,
  ]

  if (failure.userStderr) {
    parts.push(`stderr:\n${truncateText(failure.userStderr, 3000).text}`)
  }

  if (failure.message) {
    parts.push(`Message: ${failure.message}`)
  }

  if (failure.error) {
    parts.push(
      `Error: ${failure.error.type}: ${failure.error.message}`,
      `Stack:\n${truncateText(failure.error.stack, 3000).text}`,
    )
  }

  return parts.join('\n')
}

function codingSections(
  feature: AiFeature,
  context: AiContext,
  content: ContentRepository,
  counter: RedactionCounter,
): RawSection[] {
  const problem = content.getProblem(context.problemId)
  const sections: RawSection[] = []

  const brief = [
    `Title: ${problem.title}`,
    `Difficulty: ${problem.difficulty}`,
    `Language: ${context.language}`,
    `Patterns: ${problem.patterns.join(', ') || 'none'}`,
    'Signature:',
    truncateText(problem.languageTemplates[context.language] ?? '', 4000).text,
    '',
    'Statement:',
    truncateText(problem.statement, 8000).text,
  ].join('\n')

  sections.push(section('problem_statement', brief, counter))

  if (context.plan?.trim()) {
    sections.push(section('learner_plan', context.plan, counter))
  }

  if (feature !== 'approach' || context.code.trim()) {
    sections.push(section('user_code', context.code, counter))
  }

  if (context.failure && feature !== 'complexity') {
    sections.push(section('failing_test', failureBody(context.failure), counter))
  }

  if (context.priorHints && context.priorHints.length > 0) {
    sections.push(
      section(
        'prior_hints',
        context.priorHints.map((hint, index) => `${index + 1}. ${hint}`).join('\n'),
        counter,
      ),
    )
  }

  if (context.question?.trim()) {
    sections.push(section('learner_question', context.question, counter))
  }

  return sections
}

function designSections(
  context: AiDesignContext,
  content: ContentRepository,
  counter: RedactionCounter,
): RawSection[] {
  const scenario = content.getDesign(context.scenarioId)
  const sections: RawSection[] = []

  const brief = [
    `Title: ${scenario.title}`,
    `Difficulty: ${scenario.difficulty}`,
    `Tags: ${scenario.tags.join(', ') || 'none'}`,
    '',
    'Prompt:',
    truncateText(scenario.prompt, 8000).text,
    '',
    'Functional requirements:',
    ...scenario.requirements.functional.map((item) => `- ${item}`),
    '',
    'Non-functional requirements:',
    ...scenario.requirements.nonFunctional.map((item) => `- ${item}`),
    '',
    `Scale: ${scenario.scale.writesPerDay} writes/day, ${scenario.scale.readsPerDay} reads/day, ${scenario.scale.retentionYears}-year retention`,
  ].join('\n')

  sections.push(section('scenario_brief', brief, counter))

  const notes = designNoteSections
    .map((entry) => {
      const value = context.notes[entry.id]?.trim()
      return value ? `${entry.label}:\n${value}` : ''
    })
    .filter(Boolean)
    .join('\n\n')

  sections.push(section('learner_notes', notes || '(No design notes written yet.)', counter))

  if (context.rubric && Object.keys(context.rubric).length > 0) {
    const answers = scenario.rubric
      .map((dimension) => {
        const answer = context.rubric?.[dimension.id]
        if (!answer || answer.score < 1) {
          return ''
        }
        return `${dimension.name} — self score ${answer.score}/4\nEvidence: ${answer.evidence || '(none)'}`
      })
      .filter(Boolean)
      .join('\n\n')

    if (answers) {
      sections.push(section('learner_rubric', answers, counter))
    }
  }

  if (context.history && context.history.length > 0) {
    sections.push(
      section(
        'conversation',
        context.history
          .map((turn) => `${turn.role === 'user' ? 'Learner' : 'Interviewer'}: ${turn.content}`)
          .join('\n\n'),
        counter,
      ),
    )
  }

  if (context.question?.trim()) {
    sections.push(section('learner_question', context.question, counter))
  }

  return sections
}

function usedTokens(sections: readonly RawSection[]): number {
  return sections.reduce((sum, entry) => sum + (entry.dropped ? 0 : entry.tokens), 0)
}

function truncateSection(entry: RawSection, maxChars: number): void {
  const next = truncateText(entry.body, maxChars)
  entry.body = next.text
  entry.truncated = true
  entry.tokens = estimateTokens(entry.body)
}

function fitSections(sections: RawSection[], budget: number, failureLine: number | null): void {
  if (usedTokens(sections) <= budget) {
    return
  }

  // 1. Drop history first.
  for (const id of ['conversation', 'prior_hints']) {
    const entry = sections.find((candidate) => candidate.id === id)
    if (entry && !entry.dropped) {
      entry.dropped = true
      if (usedTokens(sections) <= budget) {
        return
      }
    }
  }

  // 2. Truncate code around the failing line.
  const code = sections.find((candidate) => candidate.id === 'user_code')
  if (code && !code.dropped) {
    const otherTokens = usedTokens(sections) - code.tokens
    const chars = Math.max(800, (budget - otherTokens) * 4)
    code.body = sliceCodeAroundLine(code.body, failureLine, chars)
    code.truncated = true
    code.tokens = estimateTokens(code.body)
    if (usedTokens(sections) <= budget) {
      return
    }
  }

  // 3. Summarize the problem brief.
  for (const id of ['problem_statement', 'scenario_brief']) {
    const entry = sections.find((candidate) => candidate.id === id)
    if (entry && !entry.dropped) {
      const target = Math.max(600, (budget - (usedTokens(sections) - entry.tokens)) * 2)
      truncateSection(entry, target)
      if (usedTokens(sections) <= budget) {
        return
      }
    }
  }

  // 4. Trim the failing test.
  const failure = sections.find((candidate) => candidate.id === 'failing_test')
  if (failure && !failure.dropped) {
    const target = Math.max(600, (budget - (usedTokens(sections) - failure.tokens)) * 2)
    truncateSection(failure, target)
    if (usedTokens(sections) <= budget) {
      return
    }
  }

  // 5. Drop optional context: question, plan, rubric self-assessment.
  for (const id of ['learner_question', 'learner_plan', 'learner_rubric']) {
    const entry = sections.find((candidate) => candidate.id === id)
    if (entry && !entry.dropped) {
      entry.dropped = true
      if (usedTokens(sections) <= budget) {
        return
      }
    }
  }

  // 6. Trim notes, then hard-cap the remaining sections from the end.
  for (const id of ['learner_notes', 'user_code', 'problem_statement', 'scenario_brief']) {
    const entry = sections.find((candidate) => candidate.id === id)
    if (entry && !entry.dropped) {
      const target = Math.max(600, (budget - (usedTokens(sections) - entry.tokens)) * 2)
      truncateSection(entry, target)
      if (usedTokens(sections) <= budget) {
        return
      }
    }
  }

  while (usedTokens(sections) > budget) {
    const droppable = [...sections].reverse().find((entry) => !entry.dropped)
    if (!droppable) {
      return
    }
    droppable.dropped = true
  }
}

function wrapSection(entry: RawSection, language: Language | null): string {
  const attribute = entry.id === 'user_code' && language ? ` language="${language}"` : ''
  return `<${entry.id}${attribute}>\n${entry.body}\n</${entry.id}>`
}

function isDesignRequest(request: AiRequest): request is {
  readonly feature: 'designNotes' | 'followUp'
  readonly design: AiDesignContext
} {
  return request.feature === 'designNotes' || request.feature === 'followUp'
}

export function buildContext(request: AiRequest, options: BuildContextOptions): BuiltContext {
  const counter: RedactionCounter = { count: 0 }
  let hintLevel = 1
  let failureLine: number | null = null
  let language: Language | null = null
  let sections: RawSection[]

  if (isDesignRequest(request)) {
    sections = designSections(request.design, options.content, counter)
  } else {
    hintLevel = clamp(request.context.hintLevel ?? 1, 1, 4)
    failureLine = request.context.failure?.error?.userLine ?? null
    language = request.context.language
    sections = codingSections(request.feature, request.context, options.content, counter)
  }

  const system = systemPrompt(request.feature, hintLevel)
  const maxOutputTokens = outputBudget[request.feature]
  const budgetTokens = Math.max(1024, Math.floor(options.contextWindow * 0.75) - maxOutputTokens)

  fitSections(sections, budgetTokens - estimateTokens(system), failureLine)

  const included = sections.filter((entry) => !entry.dropped && entry.body.trim().length > 0)
  const userContent = included.map((entry) => wrapSection(entry, language)).join('\n\n')

  const estimatedTokens = estimateTokens(system) + usedTokens(sections)
  const previewSections: AiContextSection[] = sections.map((entry) => ({
    id: entry.id,
    label: entry.label,
    tokens: entry.dropped ? 0 : entry.tokens,
    truncated: entry.truncated || entry.dropped,
  }))

  const preview: AiPreview = {
    feature: request.feature,
    text: `### system\n\n${system}\n\n### user\n\n${userContent}`,
    messages: [{ role: 'user', content: userContent }],
    estimatedTokens,
    budgetTokens,
    maxOutputTokens,
    sections: previewSections,
    droppedSections: sections.filter((entry) => entry.dropped).map((entry) => entry.label),
    redactions: counter.count,
  }

  return { system, messages: preview.messages, preview, hintLevel }
}
