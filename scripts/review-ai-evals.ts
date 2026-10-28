import { readFile, writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline/promises'

interface ZooFailure {
  readonly status: string
  readonly input: unknown
  readonly expected: unknown
  readonly actual: unknown
  readonly stderr?: string
  readonly error?: {
    readonly type: string
    readonly message: string
    readonly stack: string
  }
}

interface ZooSolution {
  readonly id: string
  readonly bugLabel: string
  readonly code: string
  readonly failure: ZooFailure
}

interface ZooProblem {
  readonly id: string
  readonly title: string
  readonly statement: string
  readonly signature: string
  readonly patterns: readonly string[]
  readonly solutions: readonly ZooSolution[]
}

interface BugZoo {
  readonly version: number
  readonly problems: readonly ZooProblem[]
}

interface EvalCase {
  readonly problemId: string
  readonly solutionId: string
  readonly bugLabel: string
  readonly feature: 'explain' | 'hint'
  readonly labelMatch: boolean | null
  readonly rawLeak: boolean
  readonly guardedLeak: boolean
  readonly warning: string | null
  readonly latencyMs: number
  readonly inputTokens: number
  readonly outputTokens: number
  readonly droppedSections: readonly string[]
  readonly rawResponse?: string
  readonly guardedResponse?: string
  helpfulness: number | null
  diagnosisCorrect: boolean | null
}

interface EvalResults {
  readonly generatedAt: string
  readonly provider: string
  readonly summary: Record<string, unknown>
  readonly cases: EvalCase[]
  humanSummary?: {
    readonly reviewedCases: number
    readonly totalCases: number
    readonly explainDiagnosisReviewed: number
    readonly explainDiagnosisCorrect: number
    readonly explainDiagnosisAccuracy: number | null
    readonly helpfulnessReviewed: number
    readonly helpfulnessAverage: number | null
    readonly helpfulnessByFeature: {
      readonly explain: number | null
      readonly hint: number | null
    }
  }
}

function responseText(value: string | undefined): string {
  if (!value) {
    return '(no response captured — rerun `pnpm evals` with the current harness)'
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

function average(values: readonly number[]): number | null {
  if (values.length === 0) {
    return null
  }

  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
}

async function main(): Promise<void> {
  const target = process.argv[2] ?? 'docs/evals/results-openai-compatible.json'
  const zoo = JSON.parse(await readFile('docs/evals/bug-zoo.json', 'utf8')) as BugZoo
  const results = JSON.parse(await readFile(target, 'utf8')) as EvalResults
  const solutions = new Map<string, { problem: ZooProblem; solution: ZooSolution }>()

  for (const problem of zoo.problems) {
    for (const solution of problem.solutions) {
      solutions.set(solution.id, { problem, solution })
    }
  }

  const pending = results.cases.filter((entry) => entry.helpfulness === null)

  if (pending.length === 0) {
    console.log('All cases already have a helpfulness rating.')
  } else {
    console.log(`Reviewing ${pending.length} unrated case(s) from ${target}.`)
    console.log('Ground-truth labels are shown for review; read the response before deciding.')
  }

  const readline = createInterface({ input: process.stdin, output: process.stdout })

  try {
    for (const [index, entry] of results.cases.entries()) {
      if (entry.helpfulness !== null) {
        continue
      }

      const found = solutions.get(entry.solutionId)

      if (!found) {
        console.warn(`\nSkipping ${entry.solutionId}: no matching bug-zoo solution.`)
        continue
      }

      console.log(`\n${'='.repeat(78)}`)
      console.log(
        `[${index + 1}/${results.cases.length}] ${found.problem.title} / ${entry.solutionId}`,
      )
      console.log(`Feature: ${entry.feature}`)
      console.log(`Warning: ${entry.warning ?? 'none'}`)
      console.log(`\nCode:\n${found.solution.code}`)
      console.log(`\nFailing test:\n${JSON.stringify(found.solution.failure, null, 2)}`)
      console.log(
        `\nModel response (guarded):\n${responseText(entry.guardedResponse ?? entry.rawResponse)}`,
      )
      console.log(`\nGround-truth bug label: ${entry.bugLabel}`)
      console.log(
        `Automated label match: ${entry.labelMatch === null ? 'n/a' : entry.labelMatch ? 'yes' : 'no'}`,
      )

      let diagnosis: boolean | null = null

      if (entry.feature === 'explain') {
        while (true) {
          const answer = (await readline.question('\nDiagnosis correct? [y]es / [n]o / [s]kip: '))
            .trim()
            .toLowerCase()

          if (answer === 'y') {
            diagnosis = true
            break
          }
          if (answer === 'n') {
            diagnosis = false
            break
          }
          if (answer === 's') {
            break
          }

          console.log('Enter y, n, or s.')
        }

        if (diagnosis === null) {
          continue
        }
      }

      let helpfulness: number | null = null

      while (true) {
        const answer = (await readline.question('Helpfulness 1-5 (or s to skip): '))
          .trim()
          .toLowerCase()

        if (answer === 's') {
          break
        }

        const value = Number(answer)

        if (Number.isInteger(value) && value >= 1 && value <= 5) {
          helpfulness = value
          break
        }

        console.log('Enter 1, 2, 3, 4, 5, or s.')
      }

      if (helpfulness === null) {
        continue
      }

      entry.diagnosisCorrect = diagnosis
      entry.helpfulness = helpfulness
      await writeFile(target, `${JSON.stringify(results, null, 2)}\n`, 'utf8')
      console.log('Saved.')
    }
  } finally {
    readline.close()
  }

  const explainCases = results.cases.filter((entry) => entry.feature === 'explain')
  const ratedExplain = explainCases.filter((entry) => typeof entry.diagnosisCorrect === 'boolean')
  const correctExplain = ratedExplain.filter((entry) => entry.diagnosisCorrect === true)
  const ratedHelpfulness = results.cases.filter((entry) => typeof entry.helpfulness === 'number')
  const explainHelpfulness = ratedHelpfulness.filter((entry) => entry.feature === 'explain')
  const hintHelpfulness = ratedHelpfulness.filter((entry) => entry.feature === 'hint')

  results.humanSummary = {
    reviewedCases: ratedHelpfulness.length,
    totalCases: results.cases.length,
    explainDiagnosisReviewed: ratedExplain.length,
    explainDiagnosisCorrect: correctExplain.length,
    explainDiagnosisAccuracy:
      ratedExplain.length === 0
        ? null
        : Math.round((correctExplain.length / ratedExplain.length) * 1000) / 10,
    helpfulnessReviewed: ratedHelpfulness.length,
    helpfulnessAverage: average(ratedHelpfulness.map((entry) => entry.helpfulness as number)),
    helpfulnessByFeature: {
      explain: average(explainHelpfulness.map((entry) => entry.helpfulness as number)),
      hint: average(hintHelpfulness.map((entry) => entry.helpfulness as number)),
    },
  }

  await writeFile(target, `${JSON.stringify(results, null, 2)}\n`, 'utf8')

  console.log(`\nHuman review summary for ${target}`)
  console.table(results.humanSummary)
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
