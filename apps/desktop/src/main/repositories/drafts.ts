import type { DraftRecord } from '../../shared/types'
import type { AppDatabase } from '../database'

export class DraftsRepository {
  constructor(private readonly database: AppDatabase) {}

  get(problemId: string, language: string): DraftRecord | null {
    const row = this.database.connection
      .prepare('SELECT code, plan FROM drafts WHERE problem_id = ? AND language = ?')
      .get(problemId, language) as { code?: string; plan?: string } | undefined

    if (!row) {
      return null
    }

    return { code: row.code ?? '', plan: row.plan ?? '' }
  }

  save(problemId: string, language: string, code: string, plan = ''): void {
    const now = new Date().toISOString()
    this.database.connection
      .prepare(
        `INSERT INTO drafts (problem_id, language, code, plan, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(problem_id, language)
         DO UPDATE SET code = excluded.code, plan = excluded.plan, updated_at = excluded.updated_at`,
      )
      .run(problemId, language, code, plan, now)
  }
}
