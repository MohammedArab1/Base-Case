import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { app } from 'electron'
import { validatePack } from '@base-case/schema'
import type {
  DesignScenario,
  HintFile,
  Lesson,
  PackManifest,
  Problem,
  Rubric,
  Signature,
  TestCase,
} from '@base-case/schema'
import type {
  ContentCollectionSummary,
  DesignScenarioDetail,
  DesignScenarioSummary,
  Language,
  LessonDetail,
  LessonExercise,
  LessonSummary,
  ProblemDetail,
  ProblemSummary,
} from '../shared/types'
import type { ContentPackSummary } from '../shared/types'
import { getLogger } from './logger'

interface LoadedPack {
  readonly manifest: PackManifest
  readonly source: ContentPackSummary['source']
  readonly directory: string
}

interface LoadedProblem {
  readonly manifest: Problem
  readonly statement: string
  readonly hints: HintFile
  readonly sampleTests: readonly TestCase[]
  readonly hiddenTests: readonly TestCase[]
  readonly packId: string
  readonly packName: string
  readonly source: ProblemSummary['source']
  readonly collections: readonly string[]
}

interface LoadedDesign {
  readonly manifest: DesignScenario
  readonly prompt: string
  readonly rubric: Rubric
  readonly reference: string
  readonly referenceSceneJson: string | null
  readonly packId: string
  readonly packName: string
  readonly source: DesignScenarioSummary['source']
}

interface LoadedLesson {
  readonly manifest: Lesson
  readonly content: string
  readonly packId: string
  readonly packName: string
  readonly source: LessonSummary['source']
}

export interface ProblemSearchDocument {
  readonly problemId: string
  readonly title: string
  readonly patterns: string
  readonly packName: string
  readonly body: string
}

export interface JudgeRunParams {
  readonly problemId: string
  readonly language: Language
  readonly code: string
  readonly mode: 'sample' | 'submit' | 'review'
  readonly signature: Signature
  readonly limits: Problem['limits']
  readonly checker: Problem['checker']
  readonly tests: readonly {
    readonly index: number
    readonly isSample: boolean
    readonly input: unknown
    readonly expected: unknown
  }[]
}

function contentRoot(): string {
  if (process.env.BASE_CASE_CONTENT_PATH) {
    return process.env.BASE_CASE_CONTENT_PATH
  }

  if (app.isPackaged) {
    return join(process.resourcesPath, 'content')
  }

  const candidates = [
    join(app.getAppPath(), '../../content'),
    join(app.getAppPath(), '../../../content'),
    join(process.cwd(), 'content'),
    join(process.cwd(), '../../content'),
  ]

  return (
    candidates.find((candidate) => existsSync(join(candidate, 'packs', 'core', 'pack.json'))) ??
    candidates[0]!
  )
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T
}

async function packDirectories(root: string): Promise<string[]> {
  try {
    const entries = await readdir(root, { withFileTypes: true })

    return entries
      .filter((entry) => entry.isDirectory() && existsSync(join(root, entry.name, 'pack.json')))
      .map((entry) => join(root, entry.name))
      .sort()
  } catch {
    return []
  }
}

function parseJsonLines<T>(contents: string, path: string): T[] {
  const values: T[] = []

  for (const [index, line] of contents.split(/\r?\n/).entries()) {
    if (line.trim().length === 0) {
      continue
    }

    try {
      values.push(JSON.parse(line) as T)
    } catch (error) {
      throw new Error(
        `${path}:${index + 1}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  return values
}

function pythonType(type: string): string {
  switch (type) {
    case 'int':
    case 'long':
      return 'int'
    case 'double':
      return 'float'
    case 'boolean':
      return 'bool'
    case 'string':
    case 'char':
      return 'str'
    case 'int[]':
    case 'long[]':
      return 'List[int]'
    case 'double[]':
      return 'List[float]'
    case 'boolean[]':
      return 'List[bool]'
    case 'string[]':
      return 'List[str]'
    case 'int[][]':
      return 'List[List[int]]'
    case 'string[][]':
      return 'List[List[str]]'
    case 'ListNode':
    case 'TreeNode':
      return type
    case 'void':
      return 'None'
    default:
      return 'object'
  }
}

function typescriptType(type: string): string {
  switch (type) {
    case 'int':
    case 'long':
    case 'double':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'string':
    case 'char':
      return 'string'
    case 'int[]':
    case 'long[]':
    case 'double[]':
      return 'number[]'
    case 'boolean[]':
      return 'boolean[]'
    case 'string[]':
      return 'string[]'
    case 'int[][]':
      return 'number[][]'
    case 'string[][]':
      return 'string[][]'
    case 'ListNode':
    case 'TreeNode':
      return `${type} | null`
    case 'void':
      return 'void'
    default:
      return 'unknown'
  }
}

function defaultValue(type: string): string {
  switch (type) {
    case 'int':
    case 'long':
    case 'double':
      return '0'
    case 'boolean':
      return 'false'
    case 'string':
    case 'char':
      return "''"
    case 'int[]':
    case 'long[]':
    case 'double[]':
    case 'boolean[]':
    case 'string[]':
    case 'int[][]':
    case 'string[][]':
      return '[]'
    case 'ListNode':
    case 'TreeNode':
      return 'null'
    default:
      return 'null'
  }
}

function languageTemplates(signature: Signature): Record<Language, string> {
  if (signature.kind !== 'function') {
    return { python: '', typescript: '' }
  }

  const params = signature.params
  const usesList = params.some((param) => pythonType(param.type).includes('List'))

  const pythonParams = params.map((param) => `${param.name}: ${pythonType(param.type)}`).join(', ')
  const pythonReturn = pythonType(signature.returns)
  const python = [
    ...(usesList ? ['from typing import List', ''] : []),
    `class ${signature.className}:`,
    `    def ${signature.method}(self, ${pythonParams}) -> ${pythonReturn}:`,
    '        # Write your solution here',
    '        pass',
    '',
  ].join('\n')

  const tsParams = params.map((param) => `${param.name}: ${typescriptType(param.type)}`).join(', ')
  const tsReturn = typescriptType(signature.returns)
  const tsBody =
    signature.returns === 'void' ? '' : `    return ${defaultValue(signature.returns)}\n`
  const typescript = [
    `class ${signature.className} {`,
    `  ${signature.method}(${tsParams}): ${tsReturn} {`,
    '    // Write your solution here',
    tsBody.trimEnd(),
    '  }',
    '}',
    '',
    `export { ${signature.className} }`,
    '',
  ]
    .filter((line) => line.length > 0)
    .join('\n')

  return { python, typescript }
}

export class ContentRepository {
  private readonly problems = new Map<string, LoadedProblem>()
  private readonly designs = new Map<string, LoadedDesign>()
  private readonly lessons = new Map<string, LoadedLesson>()
  private readonly packs = new Map<string, LoadedPack>()

  async initialize(userDataPath?: string): Promise<void> {
    this.problems.clear()
    this.designs.clear()
    this.lessons.clear()
    this.packs.clear()

    const bundledRoot = join(contentRoot(), 'packs')
    const bundledPacks = await packDirectories(bundledRoot)

    if (bundledPacks.length === 0) {
      throw new Error(`The bundled content directory has no packs: ${bundledRoot}`)
    }

    for (const directory of bundledPacks) {
      await this.loadPack(directory, 'bundled', true)
    }

    if (userDataPath) {
      for (const directory of await packDirectories(join(userDataPath, 'packs'))) {
        await this.loadPack(directory, 'user', false)
      }
    }
  }

  listProblems(): ProblemSummary[] {
    return [...this.problems.values()].map((problem) => this.summary(problem))
  }

  listCollections(): ContentCollectionSummary[] {
    const collections: ContentCollectionSummary[] = []

    for (const pack of this.packs.values()) {
      for (const collection of pack.manifest.collections ?? []) {
        collections.push({
          id: `${pack.manifest.id}/${collection.id}`,
          name: collection.name,
          description: collection.description,
          attribution: collection.attribution,
          url: collection.url,
          problemCount: collection.problems.length,
        })
      }
    }

    return collections.sort((left, right) => left.name.localeCompare(right.name))
  }

  listDesigns(): DesignScenarioSummary[] {
    return [...this.designs.values()].map((design) => this.designSummary(design))
  }

  hasLesson(lessonId: string): boolean {
    return this.lessons.has(lessonId)
  }

  listLessons(): LessonSummary[] {
    return [...this.lessons.values()]
      .map((lesson) => this.lessonSummary(lesson))
      .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title))
  }

  getLesson(lessonId: string): LessonDetail {
    const lesson = this.lessons.get(lessonId)

    if (!lesson) {
      throw new Error(`Unknown lesson: ${lessonId}`)
    }

    const packId = lesson.packId
    const prerequisites = lesson.manifest.prerequisites
      .map((slug) => this.lessons.get(`${packId}/${slug}`))
      .filter((entry): entry is LoadedLesson => entry !== undefined)
      .map((entry) => ({
        id: entry.manifest.id,
        slug: entry.manifest.slug,
        title: entry.manifest.title,
      }))

    const exercises: LessonExercise[] = [
      ...lesson.manifest.exercises.problems
        .map((slug) => this.problems.get(`${packId}/${slug}`))
        .filter((entry): entry is LoadedProblem => entry !== undefined)
        .map((entry) => ({
          kind: 'problem' as const,
          id: entry.manifest.id,
          slug: entry.manifest.slug,
          title: entry.manifest.title,
          difficulty: entry.manifest.difficulty,
          subtitle: entry.manifest.patterns.join(', '),
        })),
      ...lesson.manifest.exercises.designs
        .map((slug) => this.designs.get(`${packId}/${slug}`))
        .filter((entry): entry is LoadedDesign => entry !== undefined)
        .map((entry) => ({
          kind: 'design' as const,
          id: entry.manifest.id,
          slug: entry.manifest.slug,
          title: entry.manifest.title,
          difficulty: entry.manifest.difficulty,
          subtitle: entry.manifest.tags.join(', '),
        })),
    ]

    return {
      ...this.lessonSummary(lesson),
      content: lesson.content,
      prerequisites,
      keyPoints: lesson.manifest.keyPoints,
      complexity: lesson.manifest.complexity,
      exercises,
      commonMistakes: lesson.manifest.commonMistakes,
      interviewNotes: lesson.manifest.interviewNotes,
      checkYourself: lesson.manifest.checkYourself,
    }
  }

  getDesign(scenarioId: string): DesignScenarioDetail {
    const design = this.designs.get(scenarioId)

    if (!design) {
      throw new Error(`Unknown design scenario: ${scenarioId}`)
    }

    return {
      ...this.designSummary(design),
      prompt: design.prompt,
      requirements: design.manifest.requirements,
      scale: design.manifest.scale,
      rubric: design.rubric.dimensions,
      checklist: design.manifest.checklist ?? [],
      reference: {
        markdown: design.reference,
        sceneJson: design.referenceSceneJson,
      },
      followUps: design.manifest.followUps,
      commonMistakes: design.manifest.commonMistakes,
    }
  }

  listPacks(): ContentPackSummary[] {
    return [...this.packs.values()].map((pack) => ({
      id: pack.manifest.id,
      name: pack.manifest.name,
      version: pack.manifest.version,
      license: pack.manifest.license,
      attribution: pack.manifest.attribution,
      source: pack.source,
      problemCount: pack.manifest.problems.length,
      designCount: pack.manifest.designs.length,
      lessonCount: (pack.manifest.lessons ?? []).length,
      path: pack.directory,
    }))
  }

  bundledPackIds(): string[] {
    return [...this.packs.values()]
      .filter((pack) => pack.source === 'bundled')
      .map((pack) => pack.manifest.id)
  }

  hasPack(packId: string): boolean {
    return this.packs.has(packId)
  }

  getSummaries(ids: readonly string[]): ProblemSummary[] {
    return ids
      .map((problemId) => this.problems.get(problemId))
      .filter((problem): problem is LoadedProblem => problem !== undefined)
      .map((problem) => this.summary(problem))
  }

  searchDocuments(): ProblemSearchDocument[] {
    return [...this.problems.values()].map((problem) => ({
      problemId: problem.manifest.id,
      title: problem.manifest.title,
      patterns: problem.manifest.patterns.join(' '),
      packName: problem.packName,
      body: problem.statement,
    }))
  }

  getProblem(problemId: string): ProblemDetail {
    const problem = this.problems.get(problemId)

    if (!problem) {
      throw new Error(`Unknown problem: ${problemId}`)
    }

    return {
      ...this.summary(problem),
      statement: problem.statement,
      languageTemplates: languageTemplates(problem.manifest.signature),
      hints: problem.hints.hints,
      testCounts: {
        sample: problem.sampleTests.length,
        hidden: problem.hiddenTests.length,
      },
      commonMistakes: problem.manifest.commonMistakes,
      followUps: problem.manifest.followUps,
    }
  }

  getStatement(problemId: string): string {
    return this.problems.get(problemId)?.statement ?? ''
  }

  getRunParams(
    problemId: string,
    language: Language,
    code: string,
    mode: 'sample' | 'submit' | 'review',
  ): JudgeRunParams {
    const problem = this.problems.get(problemId)

    if (!problem) {
      throw new Error(`Unknown problem: ${problemId}`)
    }

    if (problem.manifest.signature.kind !== 'function') {
      throw new Error('Only function signatures are supported in the Phase 1 judge.')
    }

    const tests = mode === 'sample' ? problem.sampleTests : problem.hiddenTests

    return {
      problemId,
      language,
      code,
      mode,
      signature: problem.manifest.signature,
      limits: problem.manifest.limits,
      checker: problem.manifest.checker,
      tests: tests.map((test, index) => ({
        index,
        isSample: mode === 'sample',
        input: test.input,
        expected: test.expected,
      })),
    }
  }

  private async loadPack(
    directory: string,
    source: ProblemSummary['source'],
    required: boolean,
  ): Promise<void> {
    const validation = await validatePack(directory)

    if (!validation.ok || !validation.pack) {
      const details = validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n')
      const message = `Content pack is invalid: ${directory}\n${details}`

      if (required) {
        throw new Error(message)
      }

      getLogger('content').warn('pack.skipped', {
        directory,
        issues: validation.issues.slice(0, 5),
      })
      return
    }

    if (this.packs.has(validation.pack.id)) {
      const message = `Duplicate content pack id "${validation.pack.id}" from ${directory}`

      if (required) {
        throw new Error(message)
      }

      getLogger('content').warn('pack.skipped', {
        directory,
        reason: 'duplicate-pack-id',
        pack: validation.pack.id,
      })
      return
    }

    this.packs.set(validation.pack.id, {
      manifest: validation.pack,
      source,
      directory,
    })

    for (const slug of validation.pack.problems) {
      try {
        await this.loadProblem(directory, validation.pack, slug, source)
      } catch (error) {
        if (required) {
          throw error
        }

        getLogger('content').warn('problem.skipped', {
          pack: validation.pack.id,
          slug,
          message: error instanceof Error ? error.message : String(error),
        })
      }
    }

    for (const slug of validation.pack.designs) {
      try {
        await this.loadDesign(directory, validation.pack, slug, source)
      } catch (error) {
        if (required) {
          throw error
        }

        getLogger('content').warn('design.skipped', {
          pack: validation.pack.id,
          slug,
          message: error instanceof Error ? error.message : String(error),
        })
      }
    }

    for (const slug of validation.pack.lessons ?? []) {
      try {
        await this.loadLesson(directory, validation.pack, slug, source)
      } catch (error) {
        if (required) {
          throw error
        }

        getLogger('content').warn('lesson.skipped', {
          pack: validation.pack.id,
          slug,
          message: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  private async loadProblem(
    packDirectory: string,
    pack: PackManifest,
    slug: string,
    source: ProblemSummary['source'],
  ): Promise<void> {
    const directory = join(packDirectory, 'problems', slug)
    const manifest = await readJson<Problem>(join(directory, 'problem.json'))

    if (manifest.id !== `${pack.id}/${slug}`) {
      throw new Error(`Problem ${slug} has an unexpected id: ${manifest.id}`)
    }

    if (this.problems.has(manifest.id)) {
      throw new Error(`Duplicate content id "${manifest.id}" from ${packDirectory}`)
    }

    const [statement, hints, sampleJsonl, hiddenJsonl] = await Promise.all([
      readFile(join(directory, manifest.statement), 'utf8'),
      readJson<HintFile>(join(directory, manifest.hints)),
      readFile(join(directory, manifest.tests.sample), 'utf8'),
      readFile(join(directory, manifest.tests.hidden), 'utf8'),
    ])

    this.problems.set(manifest.id, {
      manifest,
      statement,
      hints,
      sampleTests: parseJsonLines<TestCase>(sampleJsonl, join(directory, manifest.tests.sample)),
      hiddenTests: parseJsonLines<TestCase>(hiddenJsonl, join(directory, manifest.tests.hidden)),
      packId: pack.id,
      packName: pack.name,
      source,
      collections: (pack.collections ?? [])
        .filter((collection) => collection.problems.includes(slug))
        .map((collection) => `${pack.id}/${collection.id}`),
    })
  }

  private summary(problem: LoadedProblem): ProblemSummary {
    return {
      id: problem.manifest.id,
      slug: problem.manifest.slug,
      title: problem.manifest.title,
      difficulty: problem.manifest.difficulty,
      patterns: problem.manifest.patterns,
      collections: problem.collections,
      packId: problem.packId,
      packName: problem.packName,
      source: problem.source,
    }
  }

  private async loadDesign(
    packDirectory: string,
    pack: PackManifest,
    slug: string,
    source: DesignScenarioSummary['source'],
  ): Promise<void> {
    const directory = join(packDirectory, 'designs', slug)
    const manifest = await readJson<DesignScenario>(join(directory, 'design.json'))

    if (manifest.id !== `${pack.id}/${slug}`) {
      throw new Error(`Design ${slug} has an unexpected id: ${manifest.id}`)
    }

    if (this.designs.has(manifest.id)) {
      throw new Error(`Duplicate design id "${manifest.id}" from ${packDirectory}`)
    }

    const [prompt, rubric, reference, referenceSceneJson] = await Promise.all([
      readFile(join(directory, manifest.prompt), 'utf8'),
      readJson<Rubric>(join(directory, manifest.rubric)),
      readFile(join(directory, manifest.reference), 'utf8'),
      manifest.referenceScene
        ? readFile(join(directory, manifest.referenceScene), 'utf8')
        : Promise.resolve(null),
    ])

    this.designs.set(manifest.id, {
      manifest,
      prompt,
      rubric,
      reference,
      referenceSceneJson,
      packId: pack.id,
      packName: pack.name,
      source,
    })
  }

  private designSummary(design: LoadedDesign): DesignScenarioSummary {
    return {
      id: design.manifest.id,
      slug: design.manifest.slug,
      title: design.manifest.title,
      difficulty: design.manifest.difficulty,
      tags: design.manifest.tags,
      packId: design.packId,
      packName: design.packName,
      source: design.source,
    }
  }

  private async loadLesson(
    packDirectory: string,
    pack: PackManifest,
    slug: string,
    source: LessonSummary['source'],
  ): Promise<void> {
    const directory = join(packDirectory, 'lessons', slug)
    const manifest = await readJson<Lesson>(join(directory, 'lesson.json'))

    if (manifest.id !== `${pack.id}/${slug}`) {
      throw new Error(`Lesson ${slug} has an unexpected id: ${manifest.id}`)
    }

    if (this.lessons.has(manifest.id)) {
      throw new Error(`Duplicate lesson id "${manifest.id}" from ${packDirectory}`)
    }

    const content = await readFile(join(directory, manifest.content), 'utf8')

    this.lessons.set(manifest.id, {
      manifest,
      content,
      packId: pack.id,
      packName: pack.name,
      source,
    })
  }

  private lessonSummary(lesson: LoadedLesson): LessonSummary {
    return {
      id: lesson.manifest.id,
      slug: lesson.manifest.slug,
      title: lesson.manifest.title,
      category: lesson.manifest.category,
      summary: lesson.manifest.summary,
      difficulty: lesson.manifest.difficulty,
      estimatedMinutes: lesson.manifest.estimatedMinutes,
      order: lesson.manifest.order,
      tags: lesson.manifest.tags,
      exerciseCount:
        lesson.manifest.exercises.problems.length + lesson.manifest.exercises.designs.length,
      packId: lesson.packId,
      packName: lesson.packName,
      source: lesson.source,
    }
  }
}
