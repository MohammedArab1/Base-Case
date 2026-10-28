import type { LessonProgress } from '../../shared/types'
import type { AppDatabase } from '../database'

interface LessonProgressRow {
  readonly lesson_id: string
  readonly completed_at: string | null
  readonly last_viewed_at: string | null
}

function toProgress(row: LessonProgressRow): LessonProgress {
  return {
    lessonId: row.lesson_id,
    completed: row.completed_at !== null,
    completedAt: row.completed_at,
    lastViewedAt: row.last_viewed_at,
  }
}

/** Local completion and recency for the learning library. */
export class LessonProgressRepository {
  constructor(private readonly database: AppDatabase) {}

  list(): LessonProgress[] {
    const rows = this.database.connection
      .prepare(
        `SELECT lesson_id, completed_at, last_viewed_at
         FROM lesson_progress
         ORDER BY COALESCE(last_viewed_at, '') DESC, lesson_id ASC`,
      )
      .all() as unknown as LessonProgressRow[]

    return rows.map(toProgress)
  }

  get(lessonId: string): LessonProgress {
    const row = this.database.connection
      .prepare(
        `SELECT lesson_id, completed_at, last_viewed_at
         FROM lesson_progress
         WHERE lesson_id = ?`,
      )
      .get(lessonId) as LessonProgressRow | undefined

    return row
      ? toProgress(row)
      : { lessonId, completed: false, completedAt: null, lastViewedAt: null }
  }

  touch(lessonId: string): LessonProgress {
    const now = new Date().toISOString()

    this.database.connection
      .prepare(
        `INSERT INTO lesson_progress (lesson_id, completed_at, last_viewed_at, updated_at)
         VALUES (?, NULL, ?, ?)
         ON CONFLICT(lesson_id) DO UPDATE SET
           last_viewed_at = excluded.last_viewed_at,
           updated_at = excluded.updated_at`,
      )
      .run(lessonId, now, now)

    return this.get(lessonId)
  }

  setComplete(lessonId: string, completed: boolean): LessonProgress {
    const current = this.get(lessonId)
    const now = new Date().toISOString()
    const completedAt = completed ? (current.completedAt ?? now) : null

    this.database.connection
      .prepare(
        `INSERT INTO lesson_progress (lesson_id, completed_at, last_viewed_at, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(lesson_id) DO UPDATE SET
           completed_at = excluded.completed_at,
           updated_at = excluded.updated_at`,
      )
      .run(lessonId, completedAt, current.lastViewedAt, now)

    return this.get(lessonId)
  }
}
