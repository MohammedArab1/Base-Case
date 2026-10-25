import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AppDatabase } from '../database'
import { AiProviderRepository } from './ai-providers'

function withProviders(run: (providers: AiProviderRepository) => void): void {
  const directory = mkdtempSync(join(tmpdir(), 'base-case-ai-providers-'))
  const database = new AppDatabase(directory)

  try {
    run(new AiProviderRepository(database))
  } finally {
    database.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

describe('AiProviderRepository', () => {
  it('returns null before a provider is configured', () => {
    withProviders((providers) => {
      expect(providers.getConfig()).toBeNull()
    })
  })

  it('upserts the default provider metadata', () => {
    withProviders((providers) => {
      providers.saveConfig({
        type: 'openai-compatible',
        baseUrl: 'http://127.0.0.1:11434/v1',
        model: 'llama3',
        keyRef: 'settings:ai.apiKey',
        enabled: true,
      })

      expect(providers.getConfig()).toEqual({
        type: 'openai-compatible',
        base_url: 'http://127.0.0.1:11434/v1',
        model: 'llama3',
        key_ref: 'settings:ai.apiKey',
        enabled: 1,
      })

      providers.saveConfig({
        type: 'mock',
        baseUrl: '',
        model: 'mock',
        keyRef: null,
        enabled: true,
      })

      expect(providers.getConfig()).toEqual({
        type: 'mock',
        base_url: '',
        model: 'mock',
        key_ref: null,
        enabled: 1,
      })
    })
  })
})
