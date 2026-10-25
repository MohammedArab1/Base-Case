import { randomUUID } from 'node:crypto'
import type { RunResult, Stats } from '../../shared/types'
import type { AppDatabase } from '../database'

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
}
