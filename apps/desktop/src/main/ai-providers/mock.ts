import type { AiFeature, AiTestConnectionResult } from '../../shared/types'
import { abortError, AiProviderError } from './types'
import type { AiProvider, AiProviderRequest } from './types'

const cannedResponses: Record<AiFeature, string> = {
  explain: JSON.stringify({
    summary: 'The loop stops one index too early.',
    bugType: 'off_by_one',
    evidence: 'For the first failing test, the loop condition excludes the final index.',
    line: 4,
    nextQuestion: 'What is the last index your loop visits?',
    confidence: 'high',
  }),
  hint: JSON.stringify({
    observation: 'You are checking every pair with nested loops.',
    insight: 'You need to remember values you have already seen.',
    nextStep: 'Store each value and its index in a hash map as you scan once.',
    concept: 'hash-map',
    revealLevel: 2,
  }),
  approach: JSON.stringify({
    matchesIntendedPattern: true,
    strengths: ['Identifies the need for O(1) lookup'],
    risks: ['Does not handle duplicate values explicitly'],
    suggestedQuestion: 'What should happen if the same value appears twice?',
  }),
  complexity: JSON.stringify({
    time: 'O(n^2)',
    space: 'O(1)',
    reasoning: 'The nested loop compares every pair.',
    confidence: 'medium',
  }),
  mistakeTags: JSON.stringify({
    suggestions: [
      {
        tagId: 'off-by-one',
        reason: 'The loop condition in the failing test excludes the final index.',
      },
      {
        tagId: 'state-management',
        reason: 'The saved index is overwritten before the complement check runs.',
      },
    ],
  }),
  explainBack: JSON.stringify({
    verdict: 'partial',
    strengths: ['Names the hash-map lookup correctly.'],
    gaps: ['Does not explain why checking before inserting prevents self-pairing.'],
    nextQuestion: 'What would happen if you inserted the current value before checking it?',
  }),
  designNotes: JSON.stringify({
    dimensions: [
      {
        name: 'requirements',
        score: 3,
        evidence: 'Functional requirements are listed, but non-functional targets are vague.',
        nextStep: 'Add explicit latency, availability, and retention targets.',
      },
    ],
    strengths: ['Clear functional scope'],
    gaps: ['No capacity estimate'],
    followUpQuestions: ['What is the read-to-write ratio?'],
  }),
  followUp: JSON.stringify({
    question: 'What happens when two writers update the same key at once?',
  }),
  concept: JSON.stringify({
    explanation:
      'A hash map turns a key into a location, much like a coat check turns a ticket number into one hanging coat.',
    analogy: 'Think of labelled drawers: you go straight to the drawer with the right label.',
    example:
      'With the list [2, 7, 11], a target of 9 finds 2, then checks whether 7 is already in the map.',
    checkQuestion: 'Why does a hash map usually make a lookup cost O(1) instead of O(n)?',
    relatedConcepts: ['hash function', 'collision', 'space trade-off'],
  }),
}

const mockDelayMs = 15

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError('cancelled', 'The AI request was cancelled.'))
      return
    }

    const onAbort = (): void => {
      reject(abortError('cancelled', 'The AI request was cancelled.'))
    }

    setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * Deterministic provider used by tests, smoke runs, and onboarding. It never
 * touches the network and returns a valid structured response for every
 * feature.
 */
export class MockProvider implements AiProvider {
  readonly id = 'mock'
  readonly name = 'Mock provider'
  readonly type = 'mock' as const

  private readonly controllers = new Map<string, AbortController>()

  constructor(readonly contextWindow = 8192) {}

  available(): boolean {
    return true
  }

  async stream(request: AiProviderRequest, onChunk: (text: string) => void): Promise<void> {
    const controller = new AbortController()
    this.controllers.set(request.requestId, controller)

    const onExternalAbort = (): void => controller.abort()
    request.signal?.addEventListener('abort', onExternalAbort, { once: true })

    try {
      const response = cannedResponses[request.feature] ?? cannedResponses.explain
      const chunks = response.match(/[\s\S]{1,28}/g) ?? [response]

      for (const chunk of chunks) {
        await sleep(mockDelayMs, controller.signal)
        onChunk(chunk)
      }
    } catch (error) {
      if (controller.signal.aborted) {
        throw abortError('cancelled', 'The AI request was cancelled.')
      }
      throw error instanceof AiProviderError
        ? error
        : new AiProviderError('provider', 'The mock provider failed.')
    } finally {
      request.signal?.removeEventListener('abort', onExternalAbort)
      this.controllers.delete(request.requestId)
    }
  }

  cancel(requestId: string): void {
    this.controllers.get(requestId)?.abort()
  }

  async testConnection(): Promise<AiTestConnectionResult> {
    return {
      ok: true,
      message: 'The mock provider is ready. No network requests are made.',
      latencyMs: 0,
      model: 'mock',
    }
  }
}
