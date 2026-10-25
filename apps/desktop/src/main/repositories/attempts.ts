import { randomUUID } from 'node:crypto'
import type {
  AttemptDetail,
  AttemptMode,
  AttemptSummary,
  RunResult,
  Stats,
} from '../../shared/types'
import type { AppDatabase } from '../database'

interface AttemptRow {
  readonly id: string
  readonly problem_id: string
  readonly language: string
  readonly mode: string
  readonly status: string
  readonly passed: number
  readonly total: number
  readonly hints_used: number
  readonly solution_viewed: number
  readonly plan: string
  readonly created_at: string
}

interface AttemptDetailRow extends AttemptRow {
  readonly code: string
  readonly result_json: string
}

export interface SaveAttemptInput {
  readonly problemId: string
  readonly language: string
  readonly mode: string
  readonly code: string
  readonly result: RunResult
  readonly plan?: string
  readonly hintsUsed?: number
  readonly solutionViewed?: boolean
}

export interface ProblemAttemptProgress {
  readonly problemId: string
  readonly attempts: number
  readonly accepted: number
  readonly lastAttemptAt: string
}

export class AttemptsRepository {
  constructor(private readonly database: AppDatabase) {}

  save(input: SaveAttemptInput): string {
    const id = randomUUID()
    const createdAt = new Date().toISOString()

    this.database.connection
      .prepare(
        `INSERT INTO attempts
         (id, problem_id, language, mode, code, status, passed, total, result_json,
          hints_used, solution_viewed, plan, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        input.problemId,
        input.language,
        input.mode,
        input.code,
        input.result.status,
        input.result.passed,
        input.result.total,
        JSON.stringify(input.result),
        input.hintsUsed ?? 0,
        input.solutionViewed ? 1 : 0,
        input.plan ?? '',
        createdAt,
      )

    return id
  }

  getStats(): Stats {
    const row = this.database.connection
      .prepare(
        `SELECT
           COUNT(*) AS attempts,
           COALESCE(SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END), 0) AS accepted,
           MAX(created_at) AS last_attempt_at
         FROM attempts`,
      )
      .get() as
      { attempts?: number; accepted?: number; last_attempt_at?: string | null } | undefined

    return {
      attempts: Number(row?.attempts ?? 0),
      accepted: Number(row?.accepted ?? 0),
      lastAttemptAt: row?.last_attempt_at ?? null,
    }
  }

  countSince(sinceIso: string): { readonly attempts: number; readonly accepted: number } {
    const row = this.database.connection
      .prepare(
        `SELECT
           COUNT(*) AS attempts,
           COALESCE(SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END), 0) AS accepted
         FROM attempts
         WHERE created_at >= ?`,
      )
      .get(sinceIso) as { attempts?: number; accepted?: number } | undefined

    return {
      attempts: Number(row?.attempts ?? 0),
      accepted: Number(row?.accepted ?? 0),
    }
  }

  activeDays(): string[] {
    const rows = this.database.connection
      .prepare('SELECT created_at FROM attempts ORDER BY created_at DESC')
      .all() as unknown as { created_at: string }[]

    return rows.map((row) => row.created_at)
  }

  recentActivity(sinceIso: string): { readonly createdAt: string; readonly status: string }[] {
    const rows = this.database.connection
      .prepare(
        'SELECT created_at, status FROM attempts WHERE created_at >= ? ORDER BY created_at ASC',
      )
      .all(sinceIso) as unknown as { created_at: string; status: string }[]

    return rows.map((row) => ({ createdAt: row.created_at, status: row.status }))
  }

  latestProblemId(): string | null {
    const row = this.database.connection
      .prepare('SELECT problem_id FROM attempts ORDER BY created_at DESC, rowid DESC LIMIT 1')
      .get() as { problem_id?: string } | undefined

    return row?.problem_id ?? null
  }

  getProblemProgress(): ProblemAttemptProgress[] {
    const rows = this.database.connection
      .prepare(
        `SELECT
           problem_id,
           COUNT(*) AS attempts,
           COALESCE(SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END), 0) AS accepted,
           MAX(created_at) AS last_attempt_at
         FROM attempts
         GROUP BY problem_id`,
      )
      .all() as unknown as {
      problem_id: string
      attempts: number
      accepted: number
      last_attempt_at: string
    }[]

    return rows.map((row) => ({
      problemId: row.problem_id,
      attempts: Number(row.attempts),
      accepted: Number(row.accepted),
      lastAttemptAt: row.last_attempt_at,
    }))
  }

  listForProblem(problemId: string, limit = 20): AttemptSummary[] {
    const rows = this.database.connection
      .prepare(
        `SELECT id, problem_id, language, mode, status, passed, total, hints_used,
                solution_viewed, plan, created_at
         FROM attempts
         WHERE problem_id = ?
         ORDER BY created_at DESC, rowid DESC
         LIMIT ?`,
      )
      .all(problemId, limit) as unknown as AttemptRow[]

    return rows.map(toSummary)
  }

  listRecent(limit = 20): AttemptSummary[] {
    const rows = this.database.connection
      .prepare(
        `SELECT id, problem_id, language, mode, status, passed, total, hints_used,
                solution_viewed, plan, created_at
         FROM attempts
         ORDER BY created_at DESC, rowid DESC
         LIMIT ?`,
      )
      .all(limit) as unknown as AttemptRow[]

    return rows.map(toSummary)
  }

  get(attemptId: string): AttemptDetail {
    const row = this.database.connection
      .prepare('SELECT * FROM attempts WHERE id = ?')
      .get(attemptId) as AttemptDetailRow | undefined

    if (!row) {
      throw new Error('Attempt not found.')
    }

    const tags = this.database.connection
      .prepare('SELECT tag_id FROM attempt_mistake_tags WHERE attempt_id = ? ORDER BY tag_id ASC')
      .all(attemptId) as unknown as { tag_id: string }[]

    return {
      ...toSummary(row),
      code: row.code,
      result: JSON.parse(row.result_json) as RunResult,
      mistakeTagIds: tags.map((tag) => tag.tag_id),
    }
  }
}

function toSummary(row: AttemptRow): AttemptSummary {
  return {
    id: row.id,
    problemId: row.problem_id,
    language: row.language === 'typescript' ? 'typescript' : 'python',
    mode: toMode(row.mode),
    status: row.status,
    passed: Number(row.passed),
    total: Number(row.total),
    hintsUsed: Number(row.hints_used ?? 0),
    solutionViewed: Number(row.solution_viewed ?? 0) === 1,
    plan: row.plan ?? '',
    createdAt: row.created_at,
  }
}

function toMode(mode: string): AttemptMode {
  if (mode === 'submit') {
    return 'submit'
  }

  return mode === 'review' ? 'review' : 'sample'
}
