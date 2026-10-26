import { createServer } from 'node:http'
import type { IncomingHttpHeaders } from 'node:http'
import { afterEach, describe, expect, it } from 'vitest'
import { OpenAiCompatibleProvider } from './openai-compatible'

describe('OpenAiCompatibleProvider', () => {
  const servers: ReturnType<typeof createServer>[] = []

  afterEach(async () => {
    await Promise.all(
      servers.splice(0).map(
        (server) =>
          new Promise<void>((resolve) => {
            server.close(() => resolve())
          }),
      ),
    )
  })

  it('includes the provider response in a 401 message and sends custom headers', async () => {
    const received: IncomingHttpHeaders[] = []
    const server = createServer((request, response) => {
      received.push(request.headers)
      response.writeHead(401, { 'Content-Type': 'application/json' })
      response.end(
        JSON.stringify({
          type: 'error',
          error: {
            type: 'MissingSessionID',
            message: 'Request is missing x-opencode-session and cannot be routed efficiently.',
          },
        }),
      )
    })
    servers.push(server)
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()

    if (!address || typeof address === 'string') {
      throw new Error('Could not bind the test server.')
    }

    const provider = new OpenAiCompatibleProvider({
      baseUrl: `http://127.0.0.1:${address.port}/v1`,
      model: 'test-model',
      apiKey: 'sk-secret-value',
      contextWindow: 8192,
      headers: { 'x-opencode-session': 'session-123' },
    })

    const result = await provider.testConnection()

    expect(result.ok).toBe(false)
    expect(result.message).toContain('401')
    expect(result.message).toContain('MissingSessionID')
    expect(result.message).toContain('Request is missing x-opencode-session')
    expect(result.message).not.toContain('sk-secret-value')
    expect(received).toHaveLength(1)
    expect(received[0]?.['x-opencode-session']).toBe('session-123')
    expect(received[0]?.authorization).toBe('Bearer sk-secret-value')
  })

  it('reads JSON content parts and bare JSON stream lines', async () => {
    const server = createServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'text/event-stream' })
      response.end(
        [
          JSON.stringify({ choices: [{ delta: { content: [{ text: 'hello ' }] } }] }),
          JSON.stringify({ choices: [{ delta: { content: 'world' } }] }),
        ]
          .map((event) => `${event}\n\n`)
          .join(''),
      )
    })
    servers.push(server)
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()

    if (!address || typeof address === 'string') {
      throw new Error('Could not bind the test server.')
    }

    const provider = new OpenAiCompatibleProvider({
      baseUrl: `http://127.0.0.1:${address.port}/v1`,
      model: 'test-model',
      apiKey: '',
      contextWindow: 8192,
    })
    const chunks: string[] = []

    await provider.stream(
      {
        requestId: 'test-stream',
        feature: 'explain',
        system: 'system',
        messages: [],
        maxOutputTokens: 20,
        temperature: 0,
      },
      (text) => chunks.push(text),
    )

    expect(chunks.join('')).toBe('hello world')
  })
})
