import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { app } from 'electron'
import { validatePack } from '@base-case/schema'
import type { HintFile, PackManifest, Problem, Signature, TestCase } from '@base-case/schema'
import type { Language, ProblemDetail, ProblemSummary } from '../shared/types'

interface LoadedProblem {
  readonly manifest: Problem
  readonly statement: string
  readonly hints: HintFile
  readonly sampleTests: readonly TestCase[]
  readonly hiddenTests: readonly TestCase[]
}

export interface JudgeRunParams {
  readonly problemId: string
  readonly language: Language
  readonly code: string
  readonly mode: 'sample' | 'submit'
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
  private readonly packDirectory = join(contentRoot(), 'packs', 'core')
  private readonly problems = new Map<string, LoadedProblem>()

  async initialize(): Promise<void> {
    const validation = await validatePack(this.packDirectory)

    if (!validation.ok || !validation.pack) {
      const details = validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n')
      throw new Error(`The bundled content pack is invalid.\n${details}`)
    }

    for (const slug of validation.pack.problems) {
      await this.loadProblem(slug, validation.pack)
    }
  }

  listProblems(): ProblemSummary[] {
    return [...this.problems.values()].map((problem) => this.summary(problem))
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
    mode: 'sample' | 'submit',
  ): JudgeRunParams {
    const problem = this.problems.get(problemId)

    if (!problem) {
      throw new Error(`Unknown problem: ${problemId}`)
    }

    if (problem.manifest.signature.kind !== 'function') {
      throw new Error('Only function signatures are supported in the Phase 1 judge.')
    }

    const tests = mode === 'submit' ? problem.hiddenTests : problem.sampleTests

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
        isSample: mode !== 'submit',
        input: test.input,
        expected: test.expected,
      })),
    }
  }

  private async loadProblem(slug: string, pack: PackManifest): Promise<void> {
    const directory = join(this.packDirectory, 'problems', slug)
    const manifest = await readJson<Problem>(join(directory, 'problem.json'))

    if (manifest.id !== `${pack.id}/${slug}`) {
      throw new Error(`Problem ${slug} has an unexpected id: ${manifest.id}`)
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
    })
  }

  private summary(problem: LoadedProblem): ProblemSummary {
    return {
      id: problem.manifest.id,
      slug: problem.manifest.slug,
      title: problem.manifest.title,
      difficulty: problem.manifest.difficulty,
      patterns: problem.manifest.patterns,
    }
  }
}
