import type { ProblemNote } from '../../shared/types'
import type { AppDatabase } from '../database'

/** Free-form per-problem notes. Autosaved by the inspector. */
export class ProblemNotesRepository {
  constructor(private readonly database: AppDatabase) {}

  get(problemId: string): ProblemNote {
    const row = this.database.connection
      .prepare('SELECT notes_md, updated_at FROM problem_notes WHERE problem_id = ?')
      .get(problemId) as { notes_md?: string; updated_at?: string } | undefined

    return {
      notes: row?.notes_md ?? '',
      updatedAt: row?.updated_at ?? null,
    }
  }

  save(problemId: string, notes: string): ProblemNote {
    const updatedAt = new Date().toISOString()

    this.database.connection
      .prepare(
        `INSERT INTO problem_notes (problem_id, notes_md, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(problem_id)
         DO UPDATE SET notes_md = excluded.notes_md, updated_at = excluded.updated_at`,
      )
      .run(problemId, notes, updatedAt)

    return { notes, updatedAt }
  }
}
