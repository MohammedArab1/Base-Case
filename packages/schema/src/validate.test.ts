import { join, resolve } from 'node:path'
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
    const root = resolve('/tmp/pack')
    expect(resolveWithinRoot(root, 'problems/pair-sum/problem.json')).toBe(
      join(root, 'problems/pair-sum/problem.json'),
    )
  })

  it('rejects parent directory traversal', () => {
    expect(resolveWithinRoot(resolve('/tmp/pack'), '../secret.txt')).toBeNull()
    expect(resolveWithinRoot(resolve('/tmp/pack'), 'problems/../../secret.txt')).toBeNull()
  })

  it('rejects absolute paths', () => {
    expect(resolveWithinRoot(resolve('/tmp/pack'), resolve('/etc/passwd'))).toBeNull()
  })
})
