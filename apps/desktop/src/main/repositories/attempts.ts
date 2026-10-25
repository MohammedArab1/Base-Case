import { randomUUID } from 'node:crypto'
import type { AttemptSummary, RunResult, Stats } from '../../shared/types'
import type { AppDatabase } from '../database'

interface AttemptRow {
  readonly id: string
  readonly problem_id: string
  readonly language: string
  readonly mode: string
  readonly status: string
  readonly passed: number
  readonly total: number
  readonly created_at: string
}

export interface SaveAttemptInput {
  readonly problemId: string
  readonly language: string
  readonly mode: string
  readonly code: string
  readonly result: RunResult
}

export class AttemptsRepository {
  constructor(private readonly database: AppDatabase) {}

  save(input: SaveAttemptInput): string {
    const id = randomUUID()
    const createdAt = new Date().toISOString()

    this.database.connection
      .prepare(
        `INSERT INTO attempts
         (id, problem_id, language, mode, code, status, passed, total, result_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

  listForProblem(problemId: string, limit = 20): AttemptSummary[] {
    const rows = this.database.connection
      .prepare(
        `SELECT id, problem_id, language, mode, status, passed, total, created_at
         FROM attempts
         WHERE problem_id = ?
         ORDER BY created_at DESC, rowid DESC
         LIMIT ?`,
      )
      .all(problemId, limit) as unknown as AttemptRow[]

    return rows.map((row) => ({
      id: row.id,
      problemId: row.problem_id,
      language: row.language === 'typescript' ? 'typescript' : 'python',
      mode: row.mode === 'submit' ? 'submit' : 'sample',
      status: row.status,
      passed: Number(row.passed),
      total: Number(row.total),
      createdAt: row.created_at,
    }))
  }
}
