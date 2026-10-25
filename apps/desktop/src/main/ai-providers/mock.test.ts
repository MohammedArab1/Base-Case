import { describe, expect, it } from 'vitest'
import { parseStructuredOutput } from '../ai-schemas'
import { MockProvider } from './mock'
import type { AiProviderRequest } from './types'

const request: AiProviderRequest = {
  requestId: 'req-1',
  feature: 'explain',
  system: 'system',
  messages: [{ role: 'user', content: 'Explain the failure.' }],
  maxOutputTokens: 400,
  temperature: 0.2,
}

describe('MockProvider', () => {
  it('streams a response that satisfies the feature contract', async () => {
    const provider = new MockProvider()
    const chunks: string[] = []

    await provider.stream(request, (text) => chunks.push(text))

    const raw = chunks.join('')
    expect(chunks.length).toBeGreaterThan(1)
    expect(parseStructuredOutput('explain', raw).ok).toBe(true)
  })

  it('stops when the request is cancelled', async () => {
    const provider = new MockProvider()
    const chunks: string[] = []

    const streaming = provider.stream(request, (text) => {
      chunks.push(text)
      if (chunks.length === 1) {
        provider.cancel(request.requestId)
      }
    })

    await expect(streaming).rejects.toMatchObject({ code: 'cancelled' })
  })

  it('reports a working connection without network access', async () => {
    const result = await new MockProvider().testConnection()
    expect(result.ok).toBe(true)
    expect(result.model).toBe('mock')
  })
})
