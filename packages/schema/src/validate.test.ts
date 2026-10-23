import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { resolveWithinRoot, validatePack } from './validate.js'

const corePackDirectory = fileURLToPath(new URL('../../../content/packs/core', import.meta.url))

describe('validatePack', () => {
  it('accepts the bundled core pack', async () => {
    const result = await validatePack(corePackDirectory)

    expect(result.issues).toEqual([])
    expect(result.ok).toBe(true)
    expect(result.pack?.id).toBe('core')
    expect(result.pack?.problems).toContain('pair-sum')
  })
})

describe('resolveWithinRoot', () => {
  it('resolves a normal relative path inside the root', () => {
    expect(resolveWithinRoot('/tmp/pack', 'problems/pair-sum/problem.json')).toBe(
      '/tmp/pack/problems/pair-sum/problem.json',
    )
  })

  it('rejects parent directory traversal', () => {
    expect(resolveWithinRoot('/tmp/pack', '../secret.txt')).toBeNull()
    expect(resolveWithinRoot('/tmp/pack', 'problems/../../secret.txt')).toBeNull()
  })

  it('rejects absolute paths', () => {
    expect(resolveWithinRoot('/tmp/pack', '/etc/passwd')).toBeNull()
  })
})
