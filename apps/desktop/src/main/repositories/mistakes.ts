import type { MistakeTag, MistakeTagCount } from '../../shared/types'
import type { AppDatabase } from '../database'

interface SeedTag {
  readonly id: string
  readonly label: string
  readonly description: string
}

/** A small, opinionated taxonomy beats a blank text box. Users can still add
 * their own tags later; the seed only ensures a useful default vocabulary. */
export const seedMistakeTags: readonly SeedTag[] = [
  {
    id: 'off-by-one',
    label: 'Off-by-one',
    description: 'Loop bounds, indexes, or sliding-window edges are wrong.',
  },
  {
    id: 'missed-edge-case',
    label: 'Missed edge case',
    description: 'Empty input, one element, duplicates, or overflow was not handled.',
  },
  {
    id: 'wrong-complexity',
    label: 'Wrong complexity',
    description: 'The approach is correct but too slow or uses too much memory.',
  },
  {
    id: 'misread-problem',
    label: 'Misread problem',
    description: 'The solution answers a different question than the one asked.',
  },
  {
    id: 'data-structure-choice',
    label: 'Wrong data structure',
    description: 'A map, heap, stack, or set would have made the solution simpler.',
  },
  {
    id: 'state-management',
    label: 'State management',
    description: 'Pointers, indices, or accumulators drift out of sync.',
  },
  {
    id: 'syntax',
    label: 'Syntax or API',
    description: 'A language or standard-library detail caused the failure.',
  },
  {
    id: 'time-pressure',
    label: 'Time pressure',
    description: 'The approach was known but the implementation was rushed.',
  },
]

export class MistakesRepository {
  constructor(private readonly database: AppDatabase) {
    this.seed()
  }

  list(): MistakeTag[] {
    const rows = this.database.connection
      .prepare('SELECT id, label, description FROM mistake_tags ORDER BY label ASC')
      .all() as unknown as { id: string; label: string; description: string | null }[]

    return rows.map((row) => ({
      id: row.id,
      label: row.label,
      description: row.description,
    }))
  }

  listForAttempt(attemptId: string): string[] {
    const rows = this.database.connection
      .prepare('SELECT tag_id FROM attempt_mistake_tags WHERE attempt_id = ? ORDER BY tag_id ASC')
      .all(attemptId) as unknown as { tag_id: string }[]

    return rows.map((row) => row.tag_id)
  }

  /** Replaces the tag set for an attempt, which keeps retagging idempotent. */
  tagAttempt(attemptId: string, tagIds: readonly string[]): string[] {
    const exists = this.database.connection
      .prepare('SELECT 1 AS found FROM attempts WHERE id = ?')
      .get(attemptId) as { found?: number } | undefined

    if (!exists) {
      throw new Error('Attempt not found.')
    }

    const unique = [...new Set(tagIds)]
    const insert = this.database.connection.prepare(
      `INSERT OR IGNORE INTO attempt_mistake_tags (attempt_id, tag_id, created_at)
       VALUES (?, ?, ?)`,
    )
    const now = new Date().toISOString()

    this.database.connection.exec('BEGIN')
    try {
      this.database.connection
        .prepare('DELETE FROM attempt_mistake_tags WHERE attempt_id = ?')
        .run(attemptId)

      for (const tagId of unique) {
        const tag = this.database.connection
          .prepare('SELECT 1 AS found FROM mistake_tags WHERE id = ?')
          .get(tagId) as { found?: number } | undefined

        if (!tag) {
          throw new Error(`Unknown mistake tag: ${tagId}`)
        }

        insert.run(attemptId, tagId, now)
      }

      this.database.connection.exec('COMMIT')
    } catch (error) {
      this.database.connection.exec('ROLLBACK')
      throw error
    }

    return this.listForAttempt(attemptId)
  }

  counts(): MistakeTagCount[] {
    const rows = this.database.connection
      .prepare(
        `SELECT t.id AS tag_id, t.label AS label, COUNT(a.attempt_id) AS count
         FROM mistake_tags t
         LEFT JOIN attempt_mistake_tags a ON a.tag_id = t.id
         GROUP BY t.id, t.label
         HAVING count > 0
         ORDER BY count DESC, t.label ASC`,
      )
      .all() as unknown as { tag_id: string; label: string; count: number }[]

    return rows.map((row) => ({
      tagId: row.tag_id,
      label: row.label,
      count: Number(row.count),
    }))
  }

  private seed(): void {
    const insert = this.database.connection.prepare(
      `INSERT OR IGNORE INTO mistake_tags (id, label, description, created_at)
       VALUES (?, ?, ?, ?)`,
    )
    const now = new Date().toISOString()

    for (const tag of seedMistakeTags) {
      insert.run(tag.id, tag.label, tag.description, now)
    }
  }
}
