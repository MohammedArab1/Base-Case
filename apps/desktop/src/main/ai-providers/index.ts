import type { AiProviderType } from '../../shared/types'
import { MockProvider } from './mock'
import { OpenAiCompatibleProvider } from './openai-compatible'
import { AiProviderError } from './types'
import type { AiProvider } from './types'

export interface CreateProviderOptions {
  readonly type: AiProviderType
  readonly baseUrl: string
  readonly model: string
  readonly apiKey: string
  readonly contextWindow: number
  readonly headers?: Readonly<Record<string, string>>
}

export function createProvider(options: CreateProviderOptions): AiProvider {
  if (options.type === 'mock') {
    return new MockProvider(options.contextWindow)
  }

  if (options.type === 'openai-compatible') {
    return new OpenAiCompatibleProvider({
      baseUrl: options.baseUrl,
      model: options.model,
      apiKey: options.apiKey,
      contextWindow: options.contextWindow,
      headers: options.headers ?? {},
    })
  }

  throw new AiProviderError('disabled', 'No AI provider is configured.')
}

export type { AiProvider, AiProviderRequest } from './types'
export { AiProviderError } from './types'
