import type { AiTestConnectionResult } from '../../shared/types'
import { getLogger } from '../logger'
import { abortError, AiProviderError } from './types'
import type { AiProvider, AiProviderRequest } from './types'

const defaultTimeoutMs = 120_000
const testTimeoutMs = 15_000

type JsonMode = 'schema' | 'object' | 'none'

function sanitizeProviderDetail(detail: string): string {
  return truncate(
    detail
      .replace(/\b(?:sk|rk|pk)-[A-Za-z0-9_-]{8,}\b/g, '[redacted-key]')
      .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]')
      .replace(/("?(?:x-opencode-session|session)"?\s*[:=]\s*)["']?[^"',}\s]+/gi, '$1[redacted]')
      .replace(/\s+/g, ' ')
      .trim(),
    800,
  )
}

function describeStatus(status: number, detail: string): string {
  const providerDetail = sanitizeProviderDetail(detail)

  if (status === 401 || status === 403) {
    return `The provider rejected the API key or request (${status}).${
      providerDetail ? ` Provider response: ${providerDetail}.` : ''
    } Check the key, custom headers, and endpoint in Settings.`
  }
  if (status === 404) {
    return 'The provider endpoint was not found (404). Check the base URL and model name.'
  }
  if (status === 429) {
    return 'The provider is rate-limiting requests (429). Wait a moment and try again.'
  }
  if (status >= 500) {
    return `The provider returned a server error (${status}). Try again later.`
  }
  return `The provider returned ${status}: ${truncate(providerDetail || detail, 500)}`
}

export interface OpenAiCompatibleOptions {
  readonly baseUrl: string
  readonly model: string
  readonly apiKey: string
  readonly contextWindow: number
  readonly headers?: Readonly<Record<string, string>>
  readonly timeoutMs?: number
}

interface ChatCompletionPayload {
  readonly choices?: readonly {
    readonly delta?: { readonly content?: unknown }
    readonly message?: { readonly content?: unknown }
    readonly text?: string
  }[]
}

function contentText(content: unknown): string {
  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part
        }

        if (part && typeof part === 'object' && 'text' in part) {
          const text = (part as { text?: unknown }).text
          return typeof text === 'string' ? text : ''
        }

        return ''
      })
      .join('')
  }

  return ''
}

function choiceText(payload: ChatCompletionPayload): string {
  const choice = payload.choices?.[0]
  return (
    contentText(choice?.delta?.content) ||
    contentText(choice?.message?.content) ||
    choice?.text ||
    ''
  )
}

function truncate(value: string, limit: number): string {
  return value.length <= limit ? value : `${value.slice(0, limit)}… [truncated]`
}

/**
 * Adapter for the OpenAI chat-completions shape, which covers OpenAI,
 * OpenRouter, Groq, Together, Ollama, LM Studio, and vLLM.
 */
export class OpenAiCompatibleProvider implements AiProvider {
  readonly id = 'openai-compatible'
  readonly name = 'OpenAI-compatible provider'
  readonly type = 'openai-compatible' as const

  private readonly controllers = new Map<string, AbortController>()

  constructor(private readonly options: OpenAiCompatibleOptions) {}

  get contextWindow(): number {
    return this.options.contextWindow
  }

  available(): boolean {
    return this.options.baseUrl.trim().length > 0 && this.options.model.trim().length > 0
  }

  async stream(request: AiProviderRequest, onChunk: (text: string) => void): Promise<void> {
    const controller = new AbortController()
    this.controllers.set(request.requestId, controller)

    const timeout = setTimeout(() => {
      controller.abort(abortError('timeout', 'The provider did not respond in time.'))
    }, this.options.timeoutMs ?? defaultTimeoutMs)

    const onExternalAbort = (): void => controller.abort()
    request.signal?.addEventListener('abort', onExternalAbort, { once: true })

    try {
      const response = await this.sendWithFormatFallback(request, controller.signal)

      const contentType = response.headers.get('content-type') ?? ''

      if (contentType.includes('application/json')) {
        const payload = (await response.json()) as ChatCompletionPayload
        const text = choiceText(payload)

        getLogger('ai.provider').info('provider.json_response', {
          model: this.options.model,
          characters: text.length,
        })

        if (text) {
          onChunk(text)
        }
        return
      }

      if (!response.body) {
        throw new AiProviderError('provider', 'The provider returned an empty response.')
      }

      await this.readStream(response.body, onChunk)
    } catch (error) {
      if (controller.signal.aborted) {
        const reason = controller.signal.reason
        throw reason instanceof AiProviderError
          ? reason
          : abortError('cancelled', 'The AI request was cancelled.')
      }

      throw error instanceof AiProviderError
        ? error
        : new AiProviderError(
            'provider',
            error instanceof Error ? error.message : 'The AI request failed.',
          )
    } finally {
      clearTimeout(timeout)
      request.signal?.removeEventListener('abort', onExternalAbort)
      this.controllers.delete(request.requestId)
    }
  }

  cancel(requestId: string): void {
    this.controllers.get(requestId)?.abort()
  }

  async testConnection(): Promise<AiTestConnectionResult> {
    const started = Date.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), testTimeoutMs)
    const log = getLogger('ai.provider')

    try {
      const response = await fetch(this.endpoint(), {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          model: this.options.model,
          messages: [{ role: 'user', content: 'Reply with the single word: ready' }],
          max_tokens: 5,
          temperature: 0,
          stream: false,
        }),
        signal: controller.signal,
      })
      const latencyMs = Date.now() - started

      if (!response.ok) {
        const detail = await response.text()
        log.warn('provider.test_failed', {
          status: response.status,
          model: this.options.model,
          detail: sanitizeProviderDetail(detail),
        })
        return {
          ok: false,
          message: describeStatus(response.status, detail),
          latencyMs,
          model: this.options.model,
        }
      }

      await response.text()
      log.info('provider.test_ok', { latencyMs, model: this.options.model })
      return {
        ok: true,
        message: `Connected in ${latencyMs} ms.`,
        latencyMs,
        model: this.options.model,
      }
    } catch (error) {
      return {
        ok: false,
        message: controller.signal.aborted
          ? 'The provider did not respond within 15 seconds.'
          : error instanceof Error
            ? error.message
            : 'The connection test failed.',
        latencyMs: Date.now() - started,
        model: this.options.model,
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  private endpoint(): string {
    const base = this.options.baseUrl.trim().replace(/\/$/, '')
    return base.endsWith('/chat/completions') ? base : `${base}/chat/completions`
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(this.options.apiKey ? { Authorization: `Bearer ${this.options.apiKey}` } : {}),
      ...this.options.headers,
    }
  }

  private async sendWithFormatFallback(
    request: AiProviderRequest,
    signal: AbortSignal,
  ): Promise<Response> {
    const modes: readonly JsonMode[] = request.jsonSchema ? ['schema', 'object', 'none'] : ['none']
    const log = getLogger('ai.provider')
    let lastStatus = 0
    let lastDetail = ''

    for (const mode of modes) {
      const response = await this.post(request, signal, mode)

      if (response.ok) {
        return response
      }

      lastStatus = response.status
      lastDetail = await response.text()
      log.warn('provider.http_error', {
        status: lastStatus,
        model: this.options.model,
        format: mode,
        detail: sanitizeProviderDetail(lastDetail),
      })

      // Not every OpenAI-compatible endpoint implements `response_format`.
      // Fall back from a strict schema to JSON mode to no format at all.
      if (lastStatus !== 400 || !request.jsonSchema) {
        throw new AiProviderError('provider', describeStatus(lastStatus, lastDetail))
      }
    }

    throw new AiProviderError('provider', describeStatus(lastStatus, lastDetail))
  }

  private post(
    request: AiProviderRequest,
    signal: AbortSignal,
    jsonMode: JsonMode,
  ): Promise<Response> {
    const body: Record<string, unknown> = {
      model: this.options.model,
      messages: [{ role: 'system', content: request.system }, ...request.messages],
      stream: true,
      temperature: request.temperature,
      max_tokens: request.maxOutputTokens,
    }

    if (request.jsonSchema && jsonMode === 'schema') {
      body.response_format = {
        type: 'json_schema',
        json_schema: {
          name: `base_case_${request.feature}`,
          schema: request.jsonSchema,
          strict: false,
        },
      }
    } else if (request.jsonSchema && jsonMode === 'object') {
      body.response_format = { type: 'json_object' }
    }

    return fetch(this.endpoint(), {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
      signal,
    })
  }

  private async readStream(
    body: ReadableStream<Uint8Array>,
    onChunk: (text: string) => void,
  ): Promise<void> {
    const reader = body.getReader()
    const decoder = new TextDecoder()
    const log = getLogger('ai.provider')
    let buffer = ''
    let events = 0
    let chunks = 0
    let characters = 0

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true }).replaceAll('\r\n', '\n')

        let boundary = buffer.indexOf('\n\n')
        while (boundary !== -1) {
          const event = buffer.slice(0, boundary)
          buffer = buffer.slice(boundary + 2)
          boundary = buffer.indexOf('\n\n')

          for (const line of event.split('\n')) {
            const trimmed = line.trim()

            // Standard SSE uses `data:`; some local gateways stream bare JSON
            // objects, one per line. Accept both.
            const data = trimmed.startsWith('data:')
              ? trimmed.slice(5).trim()
              : trimmed.startsWith('{')
                ? trimmed
                : ''

            if (!data) {
              continue
            }

            if (data === '[DONE]') {
              return
            }

            try {
              const payload = JSON.parse(data) as ChatCompletionPayload
              events += 1
              const text = choiceText(payload)

              if (text) {
                chunks += 1
                characters += text.length
                onChunk(text)
              }
            } catch {
              // Ignore keep-alive or provider-specific non-JSON events.
            }
          }
        }
      }
    } finally {
      log.info('provider.stream_complete', {
        model: this.options.model,
        events,
        chunks,
        characters,
      })

      if (characters === 0) {
        log.warn('provider.empty_stream', { model: this.options.model, events })
      }
    }
  }
}
