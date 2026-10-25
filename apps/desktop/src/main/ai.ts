import { safeStorage } from 'electron'
import type {
  AiContext,
  AiEvent,
  AiPreview,
  AiProviderStatus,
  AiProviderType,
  SaveAiConfigInput,
} from '../shared/types'
import type { ContentRepository } from './content'
import type { AiProviderRepository } from './repositories/ai-providers'
import type { SettingsRepository } from './repositories/settings'

const KEY_SETTING = 'ai.apiKey'
const SYSTEM_PROMPT = `You are a Socratic coding tutor inside an offline practice app.

Rules:
- Do not give a complete solution or a full code block.
- Ask one focused question or offer a small, concrete hint.
- Use only the problem statement, the user's code, and the first failing test.
- Point to a specific line or value when possible.
- If the user asks for the answer, refuse briefly and offer the next hint level.
- Be direct and supportive. Do not use hype or "just" / "obviously".`

interface ChatMessage {
  readonly role: 'system' | 'user'
  readonly content: string
}

function truncate(value: string, limit: number): string {
  if (value.length <= limit) {
    return value
  }
  return `${value.slice(0, limit)}\n… [truncated]`
}

function failureSummary(context: AiContext): string {
  const failure = context.failure

  if (!failure) {
    return 'No failing test is available yet.'
  }

  const parts = [
    `Status: ${failure.status}`,
    `Test index: ${failure.index} (${failure.isSample ? 'sample' : 'hidden'})`,
    `Input: ${JSON.stringify(failure.input)}`,
    `Expected: ${JSON.stringify(failure.expected)}`,
    `Actual: ${JSON.stringify(failure.actual)}`,
    `Runtime: ${failure.runtimeMs} ms`,
  ]

  if (failure.userStderr) {
    parts.push(`stderr:\n${truncate(failure.userStderr, 4000)}`)
  }

  if (failure.error) {
    parts.push(
      `Error: ${failure.error.type}: ${failure.error.message}`,
      `Stack:\n${truncate(failure.error.stack, 4000)}`,
    )
  }

  return parts.join('\n')
}

function isProviderType(value: string): value is AiProviderType {
  return value === 'none' || value === 'mock' || value === 'openai-compatible'
}

export class AiService {
  constructor(
    private readonly providers: AiProviderRepository,
    private readonly settings: SettingsRepository,
    private readonly content: ContentRepository,
  ) {}

  getStatus(): AiProviderStatus {
    const stored = this.providers.getConfig()

    if (!stored) {
      return {
        type: 'none',
        baseUrl: '',
        model: '',
        enabled: false,
        hasKey: false,
      }
    }

    return {
      type: isProviderType(stored.type) ? stored.type : 'none',
      baseUrl: stored.base_url,
      model: stored.model,
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

    const hasKey = Boolean(this.settings.get(KEY_SETTING))
    const enabled = input.type !== 'none' && (input.type === 'mock' || hasKey)

    this.providers.saveConfig({
      type: input.type,
      baseUrl: input.baseUrl.trim(),
      model: input.model.trim(),
      keyRef: hasKey ? `settings:${KEY_SETTING}` : null,
      enabled,
    })

    return this.getStatus()
  }

  preview(context: AiContext): AiPreview {
    const messages = this.buildMessages(context)
    return {
      messages,
      text: messages.map((message) => `### ${message.role}\n\n${message.content}`).join('\n\n'),
    }
  }

  async stream(context: AiContext, onChunk: (text: string) => void): Promise<void> {
    const status = this.getStatus()

    if (!status.enabled) {
      throw new Error('AI is disabled. Configure a provider in Settings first.')
    }

    const messages = this.buildMessages(context)

    if (status.type === 'mock') {
      const response =
        'Look at the failing input and ask: which value would you need to have seen earlier for the current value to work? That is the complement. Where in your code do you check for it?'
      for (const chunk of response.match(/.{1,28}/g) ?? [response]) {
        await new Promise((resolve) => setTimeout(resolve, 25))
        onChunk(chunk)
      }
      return
    }

    if (status.type !== 'openai-compatible') {
      throw new Error('No supported AI provider is configured.')
    }

    const apiKey = await this.getApiKey()
    const endpoint = status.baseUrl.endsWith('/chat/completions')
      ? status.baseUrl
      : `${status.baseUrl.replace(/\/$/, '')}/chat/completions`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: status.model,
        messages,
        stream: true,
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(120_000),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`AI provider returned ${response.status}: ${truncate(body, 800)}`)
    }

    const contentType = response.headers.get('content-type') ?? ''

    if (contentType.includes('application/json')) {
      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[]
      }
      const text = data.choices?.[0]?.message?.content
      if (text) {
        onChunk(text)
      }
      return
    }

    if (!response.body) {
      throw new Error('AI provider returned an empty response.')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

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
          if (!line.startsWith('data:')) {
            continue
          }

          const data = line.slice(5).trim()
          if (data === '[DONE]') {
            return
          }

          try {
            const parsed = JSON.parse(data) as {
              choices?: { delta?: { content?: string } }[]
            }
            const text = parsed.choices?.[0]?.delta?.content
            if (text) {
              onChunk(text)
            }
          } catch {
            // Ignore keep-alive or provider-specific non-JSON events.
          }
        }
      }
    }
  }

  private buildMessages(context: AiContext): ChatMessage[] {
    const statement = truncate(this.content.getStatement(context.problemId), 8000)
    const code = truncate(context.code, 20_000)

    const userContent = [
      `Problem: ${context.problemId}`,
      `Language: ${context.language}`,
      '',
      'Problem statement:',
      statement,
      '',
      'Current code:',
      '```',
      code,
      '```',
      '',
      'First failing test:',
      failureSummary(context),
      '',
      'Give one focused next step. Do not provide a complete solution.',
    ].join('\n')

    return [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ]
  }

  private async getApiKey(): Promise<string> {
    const stored = this.settings.get(KEY_SETTING)

    if (!stored) {
      return ''
    }

    if (!(await safeStorage.isAsyncEncryptionAvailable())) {
      throw new Error('Encryption is unavailable; the stored API key cannot be read.')
    }

    return String(await safeStorage.decryptStringAsync(Buffer.from(stored, 'base64')))
  }
}

export type { AiEvent }
