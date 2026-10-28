import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { resolveWithinRoot, validatePack } from './validate.js'

const corePackDirectory = fileURLToPath(new URL('../../../content/packs/core', import.meta.url))

async function withPack(
  collections: unknown,
  run: (directory: string) => Promise<void>,
): Promise<void> {
  await withPackOptions({ collections }, run)
}

async function withPackOptions(
  options: {
    readonly collections?: unknown
    readonly lessons?: readonly string[]
  },
  run: (directory: string) => Promise<void>,
): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), 'base-case-pack-'))

  try {
    await writeFile(
      join(directory, 'pack.json'),
      JSON.stringify({
        schemaVersion: 1,
        id: 'test',
        name: 'Test pack',
        version: '0.0.0',
        license: 'MIT',
        attribution: 'Test fixture.',
        problems: [],
        designs: [],
        lessons: options.lessons ?? [],
        collections: options.collections,
      }),
    )
    await run(directory)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

describe('validatePack', () => {
  it('accepts the bundled core pack', async () => {
    const result = await validatePack(corePackDirectory)

    expect(result.issues).toEqual([])
    expect(result.ok).toBe(true)
    expect(result.pack?.id).toBe('core')
    expect(result.pack?.problems).toContain('pair-sum')
  })

  it('exposes the learning library and its linked exercises', async () => {
    const result = await validatePack(corePackDirectory)

    expect(result.pack?.lessons).toHaveLength(39)
    expect(result.pack?.lessons).toContain('complexity-and-big-o')
    expect(result.pack?.lessons).toContain('tries')
    expect(result.pack?.lessons).toContain('rate-limiting')
    expect(result.pack?.lessons).toContain('dns-and-reverse-proxies')
    expect(result.pack?.lessons).toContain('system-design-reference')
    expect(result.pack?.lessons).toContain('real-world-architectures')
  })

  it('links every design scenario from a system-design lesson', async () => {
    const result = await validatePack(corePackDirectory)
    const linkedDesigns = new Set<string>()

    for (const slug of result.pack?.lessons ?? []) {
      const lesson = JSON.parse(
        await readFile(join(corePackDirectory, 'lessons', slug, 'lesson.json'), 'utf8'),
      ) as {
        readonly category: string
        readonly exercises: { readonly designs: readonly string[] }
      }

      if (lesson.category === 'system-design') {
        for (const design of lesson.exercises.designs) {
          linkedDesigns.add(design)
        }
      }
    }

    for (const design of result.pack?.designs ?? []) {
      expect(linkedDesigns.has(design)).toBe(true)
    }
  })

  it('rejects a lesson exercise that is not in the pack', async () => {
    await withPackOptions({ lessons: ['demo'] }, async (directory) => {
      await mkdir(join(directory, 'lessons', 'demo'), { recursive: true })
      await writeFile(join(directory, 'lessons', 'demo', 'lesson.md'), '# Demo\n\nText.\n')
      await writeFile(
        join(directory, 'lessons', 'demo', 'lesson.json'),
        JSON.stringify({
          schemaVersion: 1,
          id: 'test/demo',
          slug: 'demo',
          title: 'Demo',
          category: 'foundation',
          summary: 'A demo lesson.',
          difficulty: 'easy',
          estimatedMinutes: 5,
          order: 1,
          tags: ['demo'],
          prerequisites: [],
          content: 'lesson.md',
          keyPoints: ['One', 'Two', 'Three'],
          complexity: [{ operation: 'Lookup', time: 'O(1)', space: 'O(1)' }],
          exercises: { problems: ['missing-problem'], designs: [] },
          commonMistakes: ['A mistake.'],
          interviewNotes: ['A note.'],
          checkYourself: [{ question: 'Why?', answer: 'Because.' }],
          license: 'MIT',
          attribution: 'Test fixture.',
        }),
      )

      const result = await validatePack(directory)

      expect(result.ok).toBe(false)
      expect(
        result.issues.some((issue) => issue.message.includes('is not listed in problems')),
      ).toBe(true)
    })
  })

  it('exposes the 75-problem Grind 75 collection', async () => {
    const result = await validatePack(corePackDirectory)
    const collection = result.pack?.collections?.find((entry) => entry.id === 'grind75')

    expect(collection?.problems).toHaveLength(75)
    expect(collection?.problems).toContain('pair-sum')
    expect(collection?.problems).toContain('meeting-overlap')
    expect(collection?.problems).not.toContain('compact-signals')
    expect(collection?.url).toBe('https://www.techinterviewhandbook.org/grind75/')
  })

  it('rejects collection entries that are not pack problems', async () => {
    await withPack(
      [
        {
          id: 'grind75',
          name: 'Grind 75',
          description: 'Test collection.',
          problems: ['missing-problem'],
        },
      ],
      async (directory) => {
        const result = await validatePack(directory)

        expect(result.ok).toBe(false)
        expect(
          result.issues.some((issue) => issue.message.includes('is not listed in problems')),
        ).toBe(true)
      },
    )
  })

  it('rejects duplicate collection ids', async () => {
    await withPack(
      [
        {
          id: 'grind75',
          name: 'Grind 75',
          description: 'First collection.',
          problems: [],
        },
        {
          id: 'grind75',
          name: 'Duplicate',
          description: 'Second collection.',
          problems: [],
        },
      ],
      async (directory) => {
        const result = await validatePack(directory)

        expect(result.ok).toBe(false)
        expect(
          result.issues.some((issue) => issue.message.includes('Duplicate collection id')),
        ).toBe(true)
      },
    )
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
