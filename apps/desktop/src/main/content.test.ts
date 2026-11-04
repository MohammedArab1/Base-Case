import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('electron', () => ({
  app: {
    isPackaged: false,
    getAppPath: () => process.cwd(),
  },
}))

import { ContentRepository } from './content'

const temporaryRoots: string[] = []

afterEach(async () => {
  delete process.env.BASE_CASE_CONTENT_PATH

  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  )
})

async function createContentRoot(optional: boolean): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'base-case-content-'))
  temporaryRoots.push(root)
  process.env.BASE_CASE_CONTENT_PATH = root

  await writePack(join(root, 'packs', 'core'), 'core', false)
  await writePack(join(root, 'packs', 'extra'), 'extra', optional)

  return root
}

async function writePack(directory: string, id: string, optional: boolean): Promise<void> {
  await mkdir(directory, { recursive: true })
  await writeFile(
    join(directory, 'pack.json'),
    JSON.stringify({
      schemaVersion: 1,
      id,
      name: id === 'core' ? 'Core' : 'Extra',
      version: '0.1.0',
      license: 'CC-BY-SA-4.0',
      attribution: 'Test content.',
      optional,
      problems: [],
      designs: [],
    }),
  )
}

describe('ContentRepository optional bundles', () => {
  it('lists optional packs as disabled until they are enabled', async () => {
    await createContentRoot(true)
    const content = new ContentRepository()

    await content.initialize()

    expect(content.listPacks().map((pack) => [pack.id, pack.optional, pack.enabled])).toEqual([
      ['core', false, true],
      ['extra', true, false],
    ])
  })

  it('loads an optional pack when its id is enabled', async () => {
    await createContentRoot(true)
    const content = new ContentRepository()

    await content.initialize(undefined, ['extra'])

    expect(content.listPacks().map((pack) => [pack.id, pack.enabled])).toEqual([
      ['core', true],
      ['extra', true],
    ])
  })

  it('keeps non-optional packs on regardless of the enabled list', async () => {
    await createContentRoot(false)
    const content = new ContentRepository()

    await content.initialize()

    expect(content.listPacks().map((pack) => [pack.id, pack.enabled])).toEqual([
      ['core', true],
      ['extra', true],
    ])
  })

  it('merges the core and extension study-list collection when enabled', async () => {
    process.env.BASE_CASE_CONTENT_PATH = fileURLToPath(
      new URL('../../../../content', import.meta.url),
    )
    const content = new ContentRepository()

    await content.initialize(undefined, [])
    expect(content.listProblems()).toHaveLength(81)
    expect(
      content.listCollections().find((collection) => collection.id === 'neetcode150')?.problemCount,
    ).toBe(62)

    await content.initialize(undefined, ['neetcode150'])
    expect(content.listProblems()).toHaveLength(169)
    expect(
      content.listCollections().find((collection) => collection.id === 'neetcode150')?.problemCount,
    ).toBe(150)
    expect(
      content.listProblems().filter((problem) => problem.collections.includes('neetcode150')),
    ).toHaveLength(150)
  }, 60_000)
})
