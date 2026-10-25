import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { migrations } from './migrations'

/**
 * Owns the SQLite connection, migrations, and backups. Domain operations live
 * in `repositories/` so callers depend on a narrow interface.
 */
export class AppDatabase {
  readonly path: string
  readonly connection: DatabaseSync

  constructor(userDataPath: string) {
    mkdirSync(userDataPath, { recursive: true })
    this.path = join(userDataPath, 'app.db')
    this.connection = new DatabaseSync(this.path)
    this.connection.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')
    this.runMigrations()
    this.backupIfPossible(userDataPath)
  }

  close(): void {
    this.connection.close()
  }

  private runMigrations(): void {
    this.connection.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `)

    const appliedRows = this.connection.prepare('SELECT version FROM schema_migrations').all() as {
      version: number
    }[]
    const applied = new Set(appliedRows.map((row) => Number(row.version)))

    for (const migration of migrations) {
      if (applied.has(migration.version)) {
        continue
      }

      this.connection.exec('BEGIN')
      try {
        this.connection.exec(migration.sql)
        this.connection
          .prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)')
          .run(migration.version, new Date().toISOString())
        this.connection.exec('COMMIT')
      } catch (error) {
        this.connection.exec('ROLLBACK')
        throw error
      }
    }
  }

  private backupIfPossible(userDataPath: string): void {
    const backupDirectory = join(userDataPath, 'backups')

    try {
      mkdirSync(backupDirectory, { recursive: true })
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupPath = join(backupDirectory, `app-${timestamp}.db`)
      const escapedPath = backupPath.replaceAll("'", "''")

      this.connection.exec(`VACUUM INTO '${escapedPath}'`)

      if (!this.verifyDatabase(backupPath)) {
        unlinkSync(backupPath)
        return
      }

      const backups = readdirSync(backupDirectory)
        .filter((file) => file.endsWith('.db'))
        .map((file) => ({ file, time: statSync(join(backupDirectory, file)).mtimeMs }))
        .sort((left, right) => left.time - right.time)

      while (backups.length > 7) {
        const oldest = backups.shift()
        if (oldest) {
          unlinkSync(join(backupDirectory, oldest.file))
        }
      }
    } catch (error) {
      console.error('Database backup failed:', error instanceof Error ? error.message : error)
    }
  }

  private verifyDatabase(path: string): boolean {
    if (!existsSync(path)) {
      return false
    }

    try {
      const verification = new DatabaseSync(path)
      const row = verification.prepare('PRAGMA integrity_check').get() as
        Record<string, unknown> | undefined
      verification.close()
      return Object.values(row ?? {})[0] === 'ok'
    } catch {
      return false
    }
  }
}
