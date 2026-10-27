import { readFile, stat } from 'node:fs/promises'
import { isAbsolute, join, relative, resolve } from 'node:path'
import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import {
  designSchema,
  hintsSchema,
  packSchema,
  problemSchema,
  rubricSchema,
  testCaseSchema,
} from './schemas.js'
import type {
  DesignScenario,
  HintFile,
  PackManifest,
  Problem,
  ProblemLanguage,
  Rubric,
  TestCase,
} from './types.js'

export type ValidationIssueCode =
  | 'schema'
  | 'invalid-json'
  | 'invalid-jsonl'
  | 'missing-file'
  | 'unsafe-path'
  | 'duplicate-id'
  | 'duplicate-solution'
  | 'duplicate-hint-level'
  | 'test-count'
  | 'empty-file'

export interface ValidationIssue {
  readonly code: ValidationIssueCode
  readonly path: string
  readonly message: string
}

export interface PackValidationResult {
  readonly ok: boolean
  readonly pack?: PackManifest
  readonly issues: readonly ValidationIssue[]
  readonly warnings: readonly string[]
}

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)

const validatePackManifest = ajv.compile(packSchema)
const validateProblemManifest = ajv.compile(problemSchema)
const validateDesignManifest = ajv.compile(designSchema)
const validateHints = ajv.compile(hintsSchema)
const validateRubric = ajv.compile(rubricSchema)
const validateTestCase = ajv.compile(testCaseSchema)

export function resolveWithinRoot(root: string, relativePath: string): string | null {
  if (relativePath.includes('\0') || isAbsolute(relativePath)) {
    return null
  }

  const rootPath = resolve(root)
  const candidate = resolve(rootPath, relativePath)
  const candidateRelative = relative(rootPath, candidate)

  if (candidateRelative.startsWith('..') || isAbsolute(candidateRelative)) {
    return null
  }

  return candidate
}

function formatSchemaError(error: ErrorObject): string {
  return `${error.message ?? 'is invalid'} (${error.keyword})`
}

function applyValidator(
  validate: ValidateFunction,
  value: unknown,
  label: string,
  issues: ValidationIssue[],
): boolean {
  const valid = validate(value)

  if (!valid) {
    for (const error of validate.errors ?? []) {
      issues.push({
        code: 'schema',
        path: `${label}${error.instancePath}`,
        message: formatSchemaError(error),
      })
    }
  }

  return valid
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function readJsonFile(
  absolutePath: string,
  label: string,
  issues: ValidationIssue[],
): Promise<unknown | undefined> {
  try {
    const text = await readFile(absolutePath, 'utf8')
    return JSON.parse(text) as unknown
  } catch (error) {
    issues.push({
      code: 'invalid-json',
      path: label,
      message: errorMessage(error),
    })
    return undefined
  }
}

async function checkReferencedFile(
  root: string,
  relativePath: string,
  label: string,
  issues: ValidationIssue[],
): Promise<boolean> {
  const absolutePath = resolveWithinRoot(root, relativePath)

  if (!absolutePath) {
    issues.push({
      code: 'unsafe-path',
      path: label,
      message: `Content path must stay inside the pack: ${relativePath}`,
    })
    return false
  }

  try {
    const info = await stat(absolutePath)

    if (!info.isFile()) {
      issues.push({ code: 'missing-file', path: label, message: 'Expected a file' })
      return false
    }

    const text = await readFile(absolutePath, 'utf8')

    if (text.trim().length === 0) {
      issues.push({ code: 'empty-file', path: label, message: 'File is empty' })
      return false
    }

    return true
  } catch (error) {
    issues.push({ code: 'missing-file', path: label, message: errorMessage(error) })
    return false
  }
}

interface TestReadResult {
  readonly tests: readonly TestCase[]
  readonly rawLineCount: number
}

async function readTestFile(
  root: string,
  relativePath: string,
  label: string,
  issues: ValidationIssue[],
): Promise<TestReadResult | undefined> {
  const absolutePath = resolveWithinRoot(root, relativePath)

  if (!absolutePath) {
    issues.push({
      code: 'unsafe-path',
      path: label,
      message: `Test path must stay inside the pack: ${relativePath}`,
    })
    return undefined
  }

  let text: string

  try {
    text = await readFile(absolutePath, 'utf8')
  } catch (error) {
    issues.push({ code: 'missing-file', path: label, message: errorMessage(error) })
    return undefined
  }

  const tests: TestCase[] = []
  let rawLineCount = 0

  for (const [index, line] of text.split(/\r?\n/).entries()) {
    if (line.trim().length === 0) {
      continue
    }

    rawLineCount += 1
    const lineLabel = `${label}:${index + 1}`

    try {
      const value = JSON.parse(line) as unknown

      if (applyValidator(validateTestCase, value, lineLabel, issues)) {
        tests.push(value as TestCase)
      }
    } catch (error) {
      issues.push({ code: 'invalid-jsonl', path: lineLabel, message: errorMessage(error) })
    }
  }

  return { tests, rawLineCount }
}

function warnAboutTestCounts(
  kind: 'sample' | 'hidden',
  tests: readonly TestCase[],
  label: string,
  warnings: string[],
): void {
  if (tests.length === 0) {
    warnings.push(`${label} has no ${kind} tests.`)
    return
  }

  if (kind === 'sample' && (tests.length < 3 || tests.length > 5)) {
    warnings.push(`${label} has ${tests.length} sample tests; the target is 3–5.`)
  }

  if (kind === 'hidden' && (tests.length < 15 || tests.length > 50)) {
    warnings.push(`${label} has ${tests.length} hidden tests; the target is 15–50.`)
  }
}

async function validateProblem(
  root: string,
  manifest: PackManifest,
  slug: string,
  seenIds: Set<string>,
  issues: ValidationIssue[],
  warnings: string[],
): Promise<void> {
  const manifestPath = `problems/${slug}/problem.json`
  const problemDirectory = resolveWithinRoot(root, `problems/${slug}`)

  if (!problemDirectory) {
    issues.push({ code: 'unsafe-path', path: manifestPath, message: 'Unsafe problem path' })
    return
  }

  const rawProblem = await readJsonFile(
    join(problemDirectory, 'problem.json'),
    manifestPath,
    issues,
  )

  if (
    rawProblem === undefined ||
    !applyValidator(validateProblemManifest, rawProblem, manifestPath, issues)
  ) {
    return
  }

  const problem = rawProblem as Problem
  const expectedId = `${manifest.id}/${slug}`

  if (problem.slug !== slug) {
    issues.push({
      code: 'schema',
      path: manifestPath,
      message: `Problem slug "${problem.slug}" does not match pack entry "${slug}"`,
    })
  }

  if (problem.id !== expectedId) {
    issues.push({
      code: 'schema',
      path: manifestPath,
      message: `Problem id "${problem.id}" does not match "${expectedId}"`,
    })
  }

  if (seenIds.has(problem.id)) {
    issues.push({
      code: 'duplicate-id',
      path: manifestPath,
      message: `Duplicate content id "${problem.id}"`,
    })
  }

  seenIds.add(problem.id)

  const problemRelative = `problems/${slug}`
  const problemLabel = (relativePath: string): string => `${problemRelative}/${relativePath}`

  await checkReferencedFile(
    root,
    problemLabel(problem.statement),
    problemLabel(problem.statement),
    issues,
  )
  await checkReferencedFile(
    root,
    problemLabel(problem.explanation),
    problemLabel(problem.explanation),
    issues,
  )

  for (const [index, solution] of problem.solutions.entries()) {
    await checkReferencedFile(
      root,
      problemLabel(solution.path),
      `${problemRelative}/solutions[${index}]`,
      issues,
    )
  }

  const solutionLanguages = new Set<ProblemLanguage>()

  for (const solution of problem.solutions) {
    if (solutionLanguages.has(solution.language)) {
      issues.push({
        code: 'duplicate-solution',
        path: manifestPath,
        message: `Duplicate reference solution for language "${solution.language}"`,
      })
    }
    solutionLanguages.add(solution.language)
  }

  if (!solutionLanguages.has('python') || !solutionLanguages.has('typescript')) {
    warnings.push(`${problem.id} should include Python and TypeScript reference solutions.`)
  }

  const hintsPath = problemLabel(problem.hints)
  const rawHints = await readJsonFile(join(problemDirectory, problem.hints), hintsPath, issues)

  if (rawHints !== undefined && applyValidator(validateHints, rawHints, hintsPath, issues)) {
    const hints = (rawHints as HintFile).hints
    const levels = new Set(hints.map((hint) => hint.level))

    if (levels.size !== hints.length) {
      issues.push({
        code: 'duplicate-hint-level',
        path: hintsPath,
        message: 'Hint levels must be unique',
      })
    }
  }

  const samplePath = problemLabel(problem.tests.sample)
  const sampleResult = await readTestFile(root, samplePath, samplePath, issues)

  if (sampleResult) {
    warnAboutTestCounts('sample', sampleResult.tests, problem.id, warnings)
  }

  const hiddenPath = problemLabel(problem.tests.hidden)
  const hiddenResult = await readTestFile(root, hiddenPath, hiddenPath, issues)

  if (hiddenResult) {
    warnAboutTestCounts('hidden', hiddenResult.tests, problem.id, warnings)
  }

  if (problem.commonMistakes.length === 0) {
    warnings.push(`${problem.id} has no common mistakes listed.`)
  }

  if (problem.followUps.length === 0) {
    warnings.push(`${problem.id} has no follow-up questions listed.`)
  }
}

async function validateDesign(
  root: string,
  manifest: PackManifest,
  slug: string,
  seenIds: Set<string>,
  issues: ValidationIssue[],
  warnings: string[],
): Promise<void> {
  const manifestPath = `designs/${slug}/design.json`
  const designDirectory = resolveWithinRoot(root, `designs/${slug}`)

  if (!designDirectory) {
    issues.push({ code: 'unsafe-path', path: manifestPath, message: 'Unsafe design path' })
    return
  }

  const rawDesign = await readJsonFile(join(designDirectory, 'design.json'), manifestPath, issues)

  if (
    rawDesign === undefined ||
    !applyValidator(validateDesignManifest, rawDesign, manifestPath, issues)
  ) {
    return
  }

  const design = rawDesign as DesignScenario
  const expectedId = `${manifest.id}/${slug}`

  if (design.slug !== slug) {
    issues.push({
      code: 'schema',
      path: manifestPath,
      message: `Design slug "${design.slug}" does not match pack entry "${slug}"`,
    })
  }

  if (design.id !== expectedId) {
    issues.push({
      code: 'schema',
      path: manifestPath,
      message: `Design id "${design.id}" does not match "${expectedId}"`,
    })
  }

  if (seenIds.has(design.id)) {
    issues.push({
      code: 'duplicate-id',
      path: manifestPath,
      message: `Duplicate content id "${design.id}"`,
    })
  }

  seenIds.add(design.id)

  const designRelative = `designs/${slug}`
  const designLabel = (relativePath: string): string => `${designRelative}/${relativePath}`

  await checkReferencedFile(root, designLabel(design.prompt), designLabel(design.prompt), issues)
  await checkReferencedFile(
    root,
    designLabel(design.reference),
    designLabel(design.reference),
    issues,
  )

  const rubricPath = designLabel(design.rubric)
  const rawRubric = await readJsonFile(join(designDirectory, design.rubric), rubricPath, issues)

  if (rawRubric !== undefined && applyValidator(validateRubric, rawRubric, rubricPath, issues)) {
    const rubric = rawRubric as Rubric
    const dimensionIds = new Set(rubric.dimensions.map((dimension) => dimension.id))

    if (dimensionIds.size !== rubric.dimensions.length) {
      issues.push({
        code: 'schema',
        path: rubricPath,
        message: 'Rubric dimension ids must be unique',
      })
    }
  }

  if (design.referenceScene) {
    await checkReferencedFile(
      root,
      designLabel(design.referenceScene),
      designLabel(design.referenceScene),
      issues,
    )
  } else {
    warnings.push(`${design.id} has no reference Excalidraw scene.`)
  }

  if (!design.checklist || design.checklist.length === 0) {
    warnings.push(`${design.id} has no expected-topics checklist.`)
  }

  if (design.followUps.length === 0) {
    warnings.push(`${design.id} has no follow-up questions listed.`)
  }

  if (design.commonMistakes.length === 0) {
    warnings.push(`${design.id} has no common mistakes listed.`)
  }
}

export async function validatePack(packDirectory: string): Promise<PackValidationResult> {
  const root = resolve(packDirectory)
  const issues: ValidationIssue[] = []
  const warnings: string[] = []
  const manifestLabel = 'pack.json'
  const rawPack = await readJsonFile(join(root, 'pack.json'), manifestLabel, issues)

  if (rawPack === undefined) {
    return { ok: false, issues, warnings }
  }

  if (!applyValidator(validatePackManifest, rawPack, manifestLabel, issues)) {
    return { ok: false, issues, warnings }
  }

  const manifest = rawPack as PackManifest
  const seenIds = new Set<string>()

  for (const slug of manifest.problems) {
    await validateProblem(root, manifest, slug, seenIds, issues, warnings)
  }

  for (const slug of manifest.designs) {
    await validateDesign(root, manifest, slug, seenIds, issues, warnings)
  }

  const collectionIds = new Set<string>()

  for (const collection of manifest.collections ?? []) {
    const label = `pack.json#collections.${collection.id}`

    if (collectionIds.has(collection.id)) {
      issues.push({
        code: 'schema',
        path: label,
        message: `Duplicate collection id "${collection.id}"`,
      })
    }
    collectionIds.add(collection.id)

    if (collection.problems.length === 0) {
      warnings.push(`Collection "${collection.id}" has no problems.`)
    }

    const members = new Set<string>()

    for (const slug of collection.problems) {
      if (!manifest.problems.includes(slug)) {
        issues.push({
          code: 'schema',
          path: label,
          message: `Collection entry "${slug}" is not listed in problems`,
        })
      }

      if (members.has(slug)) {
        issues.push({
          code: 'schema',
          path: label,
          message: `Duplicate problem "${slug}" in collection`,
        })
      }
      members.add(slug)
    }
  }

  if (manifest.problems.length === 0 && manifest.designs.length === 0) {
    warnings.push('Pack contains no problems or designs.')
  }

  if (!['CC-BY-SA-4.0', 'CC-BY-4.0', 'MIT'].includes(manifest.license)) {
    warnings.push(`Unrecognized pack license "${manifest.license}".`)
  }

  return {
    ok: issues.length === 0,
    pack: manifest,
    issues,
    warnings,
  }
}
