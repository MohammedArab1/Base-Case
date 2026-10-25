import type {
  AiChatMessage,
  AiErrorCode,
  AiFeature,
  AiProviderType,
  AiTestConnectionResult,
} from '../../shared/types'

export interface AiProviderRequest {
  readonly requestId: string
  readonly feature: AiFeature
  readonly system: string
  readonly messages: readonly AiChatMessage[]
  readonly maxOutputTokens: number
  readonly temperature: number
  /** When present, the provider is asked for a JSON object. */
  readonly jsonSchema?: unknown
  readonly signal?: AbortSignal
}

/**
 * Provider-agnostic streaming contract. Every implementation must be safe to
 * call without network access; the mock provider is the deterministic default.
 */
export interface AiProvider {
  readonly id: string
  readonly name: string
  readonly type: AiProviderType
  readonly contextWindow: number
  available(): boolean
  stream(request: AiProviderRequest, onChunk: (text: string) => void): Promise<void>
  cancel(requestId: string): void
  testConnection(): Promise<AiTestConnectionResult>
}

export class AiProviderError extends Error {
  constructor(
    readonly code: AiErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'AiProviderError'
  }
}

export function abortError(code: 'cancelled' | 'timeout', message: string): AiProviderError {
  return new AiProviderError(code, message)
}
