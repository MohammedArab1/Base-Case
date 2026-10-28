import type { AppDatabase } from '../database'

/**
 * Tables are listed in dependency order so an import can insert parents before
 * children. `schema_migrations` is deliberately excluded: the destination
 * database owns its schema version.
 */
export const userDataTables = [
  'settings',
  'attempts',
  'attempt_events',
  'mistake_tags',
  'attempt_mistake_tags',
  'review_cards',
  'review_logs',
  'drafts',
  'problem_notes',
  'lesson_progress',
  'design_scenes',
  'design_attempts',
  'ai_feedback',
  'ai_provider_configs',
] as const

export type UserDataTable = (typeof userDataTables)[number]

export interface UserDataBundle {
  readonly format: 'base-case-user-data'
  readonly version: 1
  readonly exportedAt: string
  readonly tables: Partial<Record<UserDataTable, readonly Record<string, unknown>[]>>
}

export type UserDataCounts = Partial<Record<UserDataTable, number>>

export class UserDataRepository {
  constructor(private readonly database: AppDatabase) {}

  export(): { readonly bundle: UserDataBundle; readonly counts: UserDataCounts } {
    const tables: Partial<Record<UserDataTable, readonly Record<string, unknown>[]>> = {}
    const counts: UserDataCounts = {}

    for (const table of userDataTables) {
      const rows =
        table === 'settings'
          ? // The encrypted API key is machine-local and never travels with an export.
            (this.database.connection
              .prepare("SELECT * FROM settings WHERE key != 'ai.apiKey'")
              .all() as unknown as Record<string, unknown>[])
          : table === 'ai_provider_configs'
            ? // key_ref points at an OS keychain entry that cannot travel with the file.
              (this.database.connection
                .prepare(
                  `SELECT id, name, type, base_url, model, NULL AS key_ref, enabled,
                          created_at, updated_at
                   FROM ai_provider_configs`,
                )
                .all() as unknown as Record<string, unknown>[])
            : (this.database.connection
                .prepare(`SELECT * FROM ${table}`)
                .all() as unknown as Record<string, unknown>[])

      tables[table] = rows
      counts[table] = rows.length
    }

    return {
      bundle: {
        format: 'base-case-user-data',
        version: 1,
        exportedAt: new Date().toISOString(),
        tables,
      },
      counts,
    }
  }

  import(raw: unknown): UserDataCounts {
    const bundle = parseBundle(raw)
    const counts: UserDataCounts = {}

    this.database.connection.exec('BEGIN')
    try {
      for (const table of userDataTables) {
        const rows = bundle.tables[table]

        if (!rows || rows.length === 0) {
          counts[table] = 0
          continue
        }

        const columns = this.columnsFor(table)
        const usable = rows.map((row) => sanitizeRow(row, columns))
        const insertColumns = [...columns]

        if (insertColumns.length === 0) {
          counts[table] = 0
          continue
        }

        const statement = this.database.connection.prepare(
          `INSERT OR REPLACE INTO ${table} (${insertColumns.join(', ')})
           VALUES (${insertColumns.map(() => '?').join(', ')})`,
        )

        for (const row of usable) {
          statement.run(...insertColumns.map((column) => row[column] ?? null))
        }

        counts[table] = usable.length
      }

      this.database.connection.exec('COMMIT')
    } catch (error) {
      this.database.connection.exec('ROLLBACK')
      throw error
    }

    return counts
  }

  private columnsFor(table: UserDataTable): string[] {
    const rows = this.database.connection
      .prepare(`PRAGMA table_info(${table})`)
      .all() as unknown as {
      name: string
    }[]

    return rows.map((row) => row.name)
  }
}

function parseBundle(raw: unknown): UserDataBundle {
  if (!raw || typeof raw !== 'object') {
    throw new Error('The selected file is not a Base Case export.')
  }

  const candidate = raw as Partial<UserDataBundle>

  if (candidate.format !== 'base-case-user-data' || candidate.version !== 1) {
    throw new Error('The selected file is not a supported Base Case export.')
  }

  if (!candidate.tables || typeof candidate.tables !== 'object') {
    throw new Error('The export is missing its data tables.')
  }

  return {
    format: 'base-case-user-data',
    version: 1,
    exportedAt: typeof candidate.exportedAt === 'string' ? candidate.exportedAt : '',
    tables: candidate.tables,
  }
}

function sanitizeRow(
  row: Record<string, unknown>,
  columns: readonly string[],
): Record<string, string | number | null> {
  const sanitized: Record<string, string | number | null> = {}

  for (const column of columns) {
    const value = row[column]

    if (value === undefined || value === null) {
      sanitized[column] = null
    } else if (typeof value === 'boolean') {
      sanitized[column] = value ? 1 : 0
    } else if (typeof value === 'number' || typeof value === 'string') {
      sanitized[column] = value
    } else {
      sanitized[column] = JSON.stringify(value)
    }
  }

  return sanitized
}
