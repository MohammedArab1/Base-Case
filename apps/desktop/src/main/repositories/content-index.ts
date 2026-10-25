import type { AppDatabase } from '../database'

export interface ContentIndexRow {
  readonly problemId: string
  readonly title: string
  readonly patterns: string
  readonly packName: string
  readonly body: string
}

/**
 * Maintains the FTS5 index used by problem search. Problem bodies stay on disk;
 * only the indexed fields are stored here.
 */
export class ContentIndexRepository {
  constructor(private readonly database: AppDatabase) {}

  replace(rows: readonly ContentIndexRow[]): void {
    this.database.connection.exec('BEGIN')

    try {
      this.database.connection.exec('DELETE FROM problem_search')
      const insert = this.database.connection.prepare(
        'INSERT INTO problem_search (problem_id, title, patterns, pack_name, body) VALUES (?, ?, ?, ?, ?)',
      )

      for (const row of rows) {
        insert.run(row.problemId, row.title, row.patterns, row.packName, row.body)
      }

      this.database.connection.exec('COMMIT')
    } catch (error) {
      this.database.connection.exec('ROLLBACK')
      throw error
    }
  }

  count(): number {
    const row = this.database.connection
      .prepare('SELECT COUNT(*) AS count FROM problem_search')
      .get() as { count?: number } | undefined

    return Number(row?.count ?? 0)
  }

  search(query: string, limit = 50): string[] {
    const terms = query.trim().split(/\s+/).filter(Boolean).slice(0, 10)

    if (terms.length === 0) {
      return []
    }

    // Quote each term so punctuation cannot become FTS operators, then use a
    // prefix match so typing "pai" finds "pair".
    const match = terms.map((term) => `"${term.replaceAll('"', '""')}"*`).join(' AND ')

    try {
      const rows = this.database.connection
        .prepare(
          `SELECT problem_id FROM problem_search
           WHERE problem_search MATCH ?
           ORDER BY rank
           LIMIT ?`,
        )
        .all(match, limit) as { problem_id?: string }[]

      return rows
        .map((row) => row.problem_id)
        .filter((problemId): problemId is string => typeof problemId === 'string')
    } catch {
      return []
    }
  }
}
