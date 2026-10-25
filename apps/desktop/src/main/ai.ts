import { safeStorage } from 'electron'
import type {
  AiEvent,
  AiFeature,
  AiFeedbackInput,
  AiPreview,
  AiProviderStatus,
  AiProviderType,
  AiRequest,
  AiRunOutcome,
  AiStructuredResult,
  AiTestConnectionResult,
  SaveAiConfigInput,
} from '../shared/types'
import { buildContext } from './ai-context'
import { applyGuardrails } from './ai-guardrails'
import { createProvider } from './ai-providers'
import { AiProviderError } from './ai-providers/types'
import type { AiProvider } from './ai-providers/types'
import { RateLimiter } from './ai-rate-limit'
import { aiJsonSchema, parseStructuredOutput } from './ai-schemas'
import type { ContentRepository } from './content'
import type { AiFeedbackRepository } from './repositories/ai-feedback'
import type { AiProviderRepository } from './repositories/ai-providers'
import type { SettingsRepository } from './repositories/settings'
import type { SettingsStore } from './settings'

const KEY_SETTING = 'ai.apiKey'
const CONTEXT_WINDOW_SETTING = 'ai.contextWindow'
const DEFAULT_CONTEXT_WINDOW = 32768
const MOCK_CONTEXT_WINDOW = 8192
const MAX_CONTEXT_WINDOW = 2_000_000
const MIN_CONTEXT_WINDOW = 2048

const featureLabels: Record<AiFeature, string> = {
  explain: 'Explain failure',
  hint: 'Hint',
  approach: 'Approach review',
  complexity: 'Complexity review',
  mistakeTags: 'Mistake tag suggestions',
  explainBack: 'Explain-back check',
  designNotes: 'Design notes review',
  followUp: 'Follow-up interviewer',
}

function isProviderType(value: string): value is AiProviderType {
  return value === 'none' || value === 'mock' || value === 'openai-compatible'
}

function toProviderError(error: unknown): AiProviderError {
  if (error instanceof AiProviderError) {
    return error
  }

  return new AiProviderError(
    'provider',
    error instanceof Error ? error.message : 'The AI request failed.',
  )
}

export class AiService {
  private readonly active = new Map<string, AiProvider>()
  private readonly limiter = new RateLimiter(8, 60_000)

  constructor(
    private readonly providers: AiProviderRepository,
    private readonly settings: SettingsRepository,
    private readonly appSettings: SettingsStore,
    private readonly content: ContentRepository,
    private readonly feedbackRepository: AiFeedbackRepository,
  ) {}

  getStatus(): AiProviderStatus {
    const stored = this.providers.getConfig()

    if (!stored) {
      return {
        type: 'none',
        baseUrl: '',
        model: '',
        contextWindow: DEFAULT_CONTEXT_WINDOW,
        enabled: false,
        hasKey: false,
      }
    }

    const type = isProviderType(stored.type) ? stored.type : 'none'

    return {
      type,
      baseUrl: stored.base_url,
      model: stored.model,
      contextWindow: this.getContextWindow(type),
      enabled: stored.enabled === 1,
      hasKey: Boolean(this.settings.get(KEY_SETTING)),
    }
  }

  async saveConfig(input: SaveAiConfigInput): Promise<AiProviderStatus> {
    if (input.clearKey) {
      this.settings.remove(KEY_SETTING)
    } else if (input.apiKey && input.apiKey.trim().length > 0) {
      if (!(await safeStorage.isAsyncEncryptionAvailable())) {
        throw new Error('Encryption is unavailable, so the API key was not saved.')
      }

      const encrypted = await safeStorage.encryptStringAsync(input.apiKey.trim())
      this.settings.set(KEY_SETTING, encrypted.toString('base64'))
    }

    if (input.contextWindow !== undefined) {
      const clamped = Math.min(
        MAX_CONTEXT_WINDOW,
        Math.max(MIN_CONTEXT_WINDOW, Math.round(input.contextWindow)),
      )
      this.settings.set(CONTEXT_WINDOW_SETTING, String(clamped))
    }

    const hasKey = Boolean(this.settings.get(KEY_SETTING))
    const enabled =
      input.type === 'mock' ||
      (input.type === 'openai-compatible' &&
        input.baseUrl.trim().length > 0 &&
        input.model.trim().length > 0)

    this.providers.saveConfig({
      type: input.type,
      baseUrl: input.baseUrl.trim(),
      model: input.model.trim(),
      keyRef: hasKey ? `settings:${KEY_SETTING}` : null,
      enabled,
    })

    return this.getStatus()
  }

  async testConnection(): Promise<AiTestConnectionResult> {
    const status = this.getStatus()

    if (status.type === 'none' || !status.enabled) {
      return {
        ok: false,
        message: 'Configure and save a provider before testing the connection.',
        latencyMs: 0,
        model: status.model,
      }
    }

    try {
      const provider = await this.createProvider(status)
      return await provider.testConnection()
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'The connection test failed.',
        latencyMs: 0,
        model: status.model,
      }
    }
  }

  /** Preview is always available so learners can inspect what would be sent. */
  preview(request: AiRequest): AiPreview {
    const status = this.getStatus()

    try {
      return buildContext(request, {
        content: this.content,
        contextWindow: status.contextWindow,
      }).preview
    } catch (error) {
      throw new AiProviderError(
        'invalid_request',
        error instanceof Error ? error.message : 'The context could not be built.',
      )
    }
  }

  async run(
    request: AiRequest,
    requestId: string,
    onChunk: (text: string) => void,
  ): Promise<AiRunOutcome> {
    this.assertEnabled(request.feature)

    if (!this.limiter.acquire()) {
      throw new AiProviderError(
        'rate_limited',
        'Too many AI requests in the last minute. Wait a moment and try again.',
      )
    }

    const status = this.getStatus()

    if (!status.enabled) {
      throw new AiProviderError(
        'disabled',
        'AI is not configured. Add a provider in Settings, or use the mock provider.',
      )
    }

    let built: ReturnType<typeof buildContext>

    try {
      built = buildContext(request, {
        content: this.content,
        contextWindow: status.contextWindow,
      })
    } catch (error) {
      throw new AiProviderError(
        'invalid_request',
        error instanceof Error ? error.message : 'The context could not be built.',
      )
    }

    const provider = await this.createProvider(status)
    const liveStream = request.feature === 'designNotes'
    let raw = ''

    this.active.set(requestId, provider)

    try {
      await provider.stream(
        {
          requestId,
          feature: request.feature,
          system: built.system,
          messages: built.messages,
          maxOutputTokens: built.preview.maxOutputTokens,
          temperature: 0.2,
          jsonSchema: aiJsonSchema(request.feature),
        },
        (text) => {
          raw += text
          if (liveStream) {
            onChunk(text)
          }
        },
      )
    } catch (error) {
      throw toProviderError(error)
    } finally {
      this.active.delete(requestId)
    }

    const parsed = parseStructuredOutput(request.feature, raw)
    const guarded = applyGuardrails(parsed.text, parsed.result, {
      feature: request.feature,
      hintLevel: built.hintLevel,
    })

    const warnings = [...guarded.warnings]

    if (parsed.error) {
      warnings.unshift(parsed.error)
    }

    const sanitized = this.sanitizeLine(request, guarded.result, warnings)
    const finalText =
      sanitized !== guarded.result && sanitized ? JSON.stringify(sanitized) : guarded.text

    // Short answers are buffered so the guardrails can run before anything is
    // shown. Design reviews stream live because they are long and low-risk.
    if (!liveStream) {
      onChunk(finalText)
    }

    return {
      text: finalText,
      result: sanitized,
      warning: warnings.length > 0 ? warnings.join(' ') : undefined,
    }
  }

  cancel(requestId: string): boolean {
    const provider = this.active.get(requestId)

    if (!provider) {
      return false
    }

    provider.cancel(requestId)
    return true
  }

  feedback(input: AiFeedbackInput): void {
    const status = this.getStatus()
    this.feedbackRepository.add({
      feature: input.feature,
      reason: input.reason,
      comment: input.comment,
      providerType: status.type,
      model: status.model,
    })
  }

  private assertEnabled(feature: AiFeature): void {
    const settings = this.appSettings.get()

    if (!settings.aiEnabled) {
      throw new AiProviderError('disabled', 'AI is turned off in Settings.')
    }

    if (!settings.aiFeatures[feature]) {
      throw new AiProviderError('disabled', `${featureLabels[feature]} is turned off in Settings.`)
    }
  }

  private getContextWindow(type: AiProviderType): number {
    const stored = this.settings.get(CONTEXT_WINDOW_SETTING)
    const parsed = stored ? Number(stored) : Number.NaN

    if (Number.isFinite(parsed) && parsed >= MIN_CONTEXT_WINDOW) {
      return Math.min(MAX_CONTEXT_WINDOW, Math.round(parsed))
    }

    return type === 'mock' ? MOCK_CONTEXT_WINDOW : DEFAULT_CONTEXT_WINDOW
  }

  private async createProvider(status: AiProviderStatus): Promise<AiProvider> {
    const provider = createProvider({
      type: status.type,
      baseUrl: status.baseUrl,
      model: status.model,
      apiKey: await this.getApiKey(),
      contextWindow: status.contextWindow,
    })

    if (!provider.available()) {
      throw new AiProviderError(
        'disabled',
        'The provider is missing a base URL or model. Check Settings.',
      )
    }

    return provider
  }

  private sanitizeLine(
    request: AiRequest,
    result: AiStructuredResult | undefined,
    warnings: string[],
  ): AiStructuredResult | undefined {
    if (!result || !('line' in result) || result.line === null) {
      return result
    }

    if (!('context' in request)) {
      return result
    }

    const lineCount = request.context.code.split('\n').length

    if (result.line < 1 || result.line > lineCount) {
      warnings.push('The cited line was outside the code, so it was cleared.')
      return { ...result, line: null }
    }

    return result
  }

  private async getApiKey(): Promise<string> {
    const stored = this.settings.get(KEY_SETTING)

    if (!stored) {
      return ''
    }

    if (!(await safeStorage.isAsyncEncryptionAvailable())) {
      throw new AiProviderError(
        'provider',
        'Encryption is unavailable; the stored API key cannot be read.',
      )
    }

    return String(await safeStorage.decryptStringAsync(Buffer.from(stored, 'base64')))
  }
}

export type { AiEvent }
