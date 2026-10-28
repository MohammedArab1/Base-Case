import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultAppSettings, defaultAiFeatureSettings } from '../shared/types'
import type { AiContext, AppSettings, DesignScenarioDetail } from '../shared/types'
import type { ContentRepository } from './content'
import { AiService, sanitizeHeaders } from './ai'
import type { AiFeedbackRepository } from './repositories/ai-feedback'
import type { AiProviderRepository, ProviderRow } from './repositories/ai-providers'
import type { SettingsRepository } from './repositories/settings'
import type { SettingsStore } from './settings'

vi.mock('electron', () => ({
  safeStorage: {
    isAsyncEncryptionAvailable: async () => true,
    encryptStringAsync: async (value: string) => Buffer.from(value),
    decryptStringAsync: async (buffer: Buffer) => ({
      result: buffer.toString(),
      shouldReEncrypt: false,
    }),
  },
}))

const problem = {
  id: 'core/pair-sum',
  slug: 'pair-sum',
  title: 'Pair Sum',
  difficulty: 'easy',
  patterns: ['hash-map'],
  packId: 'core',
  packName: 'Core',
  source: 'bundled',
  statement: 'Return the indices of the two numbers that add up to the target.',
  languageTemplates: {
    python: 'def pair_sum(nums, target): pass',
    typescript: 'function pairSum() {}',
  },
  hints: [],
  testCounts: { sample: 1, hidden: 2 },
  commonMistakes: [],
  followUps: [],
}

const design = {
  id: 'core/url-shortener',
  slug: 'url-shortener',
  title: 'URL Shortener',
  difficulty: 'medium',
  tags: ['storage'],
  packId: 'core',
  packName: 'Core',
  source: 'bundled',
  prompt: 'Design a URL shortener.',
  requirements: { functional: ['Shorten URLs'], nonFunctional: ['Low latency'] },
  scale: { writesPerDay: 1000, readsPerDay: 10000, retentionYears: 5 },
  rubric: [],
  checklist: [],
  reference: { markdown: 'SECRET', sceneJson: null },
  followUps: [],
  commonMistakes: [],
} as unknown as DesignScenarioDetail

const lesson = {
  id: 'core/hash-maps',
  title: 'Hash Maps and Sets',
  category: 'data-structure',
  difficulty: 'easy',
  summary: 'Turn a slow search into a fast lookup.',
  content: '## The idea\n\nRemember what you have seen.',
  keyPoints: ['Average O(1) lookup.', 'Store what you have seen.', 'Check before insert.'],
  complexity: [{ operation: 'Lookup', time: 'O(1)', space: 'O(1)' }],
  commonMistakes: [],
  interviewNotes: [],
  checkYourself: [],
}

const content = {
  getProblem: () => problem,
  getDesign: () => design,
  getLesson: () => lesson,
} as unknown as ContentRepository

const context: AiContext = {
  problemId: 'core/pair-sum',
  language: 'python',
  code: 'def pair_sum(nums, target):\n    seen = {}\n    for i, value in enumerate(nums):\n        pass\n    return []',
  failure: {
    index: 0,
    isSample: true,
    status: 'wrong_answer',
    input: [[1, 2], 3],
    expected: [0, 1],
    actual: [],
    userStdout: '',
    userStderr: '',
    runtimeMs: 1,
    memoryBytes: 1,
  },
}

describe('AiService', () => {
  let settingsValues: Map<string, string>
  let appSettings: AppSettings
  let providerRow: ProviderRow
  let settingsRepository: SettingsRepository
  let appSettingsStore: SettingsStore
  let providers: AiProviderRepository
  let feedback: AiFeedbackRepository
  let feedbackAdd: ReturnType<typeof vi.fn>
  let service: AiService

  beforeEach(() => {
    settingsValues = new Map()
    appSettings = {
      ...defaultAppSettings,
      aiEnabled: true,
      aiFeatures: { ...defaultAiFeatureSettings },
    }
    providerRow = {
      type: 'mock',
      base_url: '',
      model: 'mock',
      key_ref: null,
      headers_json: '{}',
      enabled: 1,
    }
    feedbackAdd = vi.fn()

    settingsRepository = {
      get: (key: string) => settingsValues.get(key) ?? null,
      set: (key: string, value: string) => {
        settingsValues.set(key, value)
      },
      remove: (key: string) => {
        settingsValues.delete(key)
      },
    } as unknown as SettingsRepository

    appSettingsStore = {
      get: () => appSettings,
      update: () => appSettings,
    } as unknown as SettingsStore

    providers = {
      getConfig: () => providerRow,
      saveConfig: vi.fn(),
    } as unknown as AiProviderRepository

    feedback = { add: feedbackAdd } as unknown as AiFeedbackRepository
    service = new AiService(providers, settingsRepository, appSettingsStore, content, feedback)
  })

  it('runs a mock request and returns a structured result', async () => {
    const chunks: string[] = []
    const outcome = await service.run({ feature: 'explain', context }, 'req-1', (text) =>
      chunks.push(text),
    )

    expect(outcome.result).toMatchObject({ bugType: 'off_by_one' })
    expect(outcome.warning).toBeUndefined()
    expect(chunks.join('')).toContain('off_by_one')
  })

  it('clears a cited line that is outside the code', async () => {
    const outcome = await service.run(
      { feature: 'explain', context: { ...context, code: 'one line' } },
      'req-line',
      () => undefined,
    )

    expect(outcome.result).toMatchObject({ line: null })
    expect(outcome.warning).toContain('outside the code')
  })

  it('suggests mistake tags from the mock provider', async () => {
    const outcome = await service.run(
      { feature: 'mistakeTags', context },
      'req-tags',
      () => undefined,
    )

    expect(outcome.result).toMatchObject({
      suggestions: expect.arrayContaining([
        expect.objectContaining({ tagId: 'off-by-one', reason: expect.any(String) }),
      ]),
    })
  })

  it('validates and stores custom provider headers', async () => {
    expect(sanitizeHeaders({ ' x-opencode-session ': ' session-1 ' })).toEqual({
      'x-opencode-session': 'session-1',
    })
    expect(() => sanitizeHeaders({ host: 'example.com' })).toThrow('managed by the app')
    expect(() => sanitizeHeaders({ 'bad header': 'value' })).toThrow('Invalid header name')

    await service.saveConfig({
      type: 'openai-compatible',
      baseUrl: 'http://127.0.0.1:8080/v1',
      model: 'local',
      headers: { 'x-opencode-session': 'session-1' },
    })

    expect(providers.saveConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { 'x-opencode-session': 'session-1' },
      }),
    )
  })

  it('clarifies a lesson with the concept contract', async () => {
    const outcome = await service.run(
      {
        feature: 'concept',
        concept: {
          lessonId: 'core/hash-maps',
          section: 'The idea',
          question: 'Why is a lookup fast?',
        },
      },
      'req-concept',
      () => undefined,
    )

    expect(outcome.result).toMatchObject({
      explanation: expect.any(String),
      relatedConcepts: expect.any(Array),
    })
  })

  it('evaluates an explain-back response', async () => {
    const outcome = await service.run(
      {
        feature: 'explainBack',
        context: { ...context, question: 'I scan once and remember values.' },
      },
      'req-explain-back',
      () => undefined,
    )

    expect(outcome.result).toMatchObject({ verdict: 'partial' })
  })

  it('refuses to run when AI is globally disabled', async () => {
    appSettings = { ...appSettings, aiEnabled: false }

    await expect(
      service.run({ feature: 'explain', context }, 'req-2', () => undefined),
    ).rejects.toMatchObject({ code: 'disabled' })
  })

  it('refuses to run a feature that is turned off', async () => {
    appSettings = {
      ...appSettings,
      aiFeatures: { ...appSettings.aiFeatures, hint: false },
    }

    await expect(
      service.run({ feature: 'hint', context }, 'req-3', () => undefined),
    ).rejects.toMatchObject({ code: 'disabled' })
  })

  it('previews context even while AI is disabled', () => {
    appSettings = { ...appSettings, aiEnabled: false }
    const preview = service.preview({ feature: 'explain', context })

    expect(preview.estimatedTokens).toBeGreaterThan(0)
    expect(preview.text).toContain('<user_code')
  })

  it('reports the mock connection as available', async () => {
    const result = await service.testConnection()
    expect(result.ok).toBe(true)
  })

  it('stores feedback locally with provider metadata', () => {
    service.feedback({ feature: 'explain', reason: 'unhelpful' })

    expect(feedbackAdd).toHaveBeenCalledWith(
      expect.objectContaining({ feature: 'explain', reason: 'unhelpful', providerType: 'mock' }),
    )
  })

  it('returns false when cancelling an unknown request', () => {
    expect(service.cancel('missing')).toBe(false)
  })
})
