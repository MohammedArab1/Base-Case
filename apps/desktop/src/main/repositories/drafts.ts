import type { AppDatabase } from '../database'

export class DraftsRepository {
  constructor(private readonly database: AppDatabase) {}

  get(problemId: string, language: string): string | null {
    const row = this.database.connection
      .prepare('SELECT code FROM drafts WHERE problem_id = ? AND language = ?')
      .get(problemId, language) as { code?: string } | undefined

    return row?.code ?? null
  }

  save(problemId: string, language: string, code: string): void {
    const now = new Date().toISOString()
    this.database.connection
      .prepare(
        `INSERT INTO drafts (problem_id, language, code, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(problem_id, language)
         DO UPDATE SET code = excluded.code, updated_at = excluded.updated_at`,
      )
      .run(problemId, language, code, now)
  }
}
