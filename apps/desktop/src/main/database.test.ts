import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { describe, expect, it } from 'vitest'
import { AppDatabase } from './database'
import { migrations } from './migrations'

const expectedTables = [
  'ai_provider_configs',
  'attempt_events',
  'attempt_mistake_tags',
  'attempts',
  'design_attempts',
  'design_scenes',
  'drafts',
  'mistake_tags',
  'review_cards',
  'schema_migrations',
  'settings',
]

function tableNames(database: AppDatabase): string[] {
  const rows = database.connection
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all() as { name: string }[]

  return rows.map((row) => row.name)
}

function appliedVersions(database: AppDatabase): number[] {
  const rows = database.connection
    .prepare('SELECT version FROM schema_migrations ORDER BY version')
    .all() as { version: number }[]

  return rows.map((row) => Number(row.version))
}

function withDirectory(run: (directory: string) => void): void {
  const directory = mkdtempSync(join(tmpdir(), 'base-case-database-'))

  try {
    run(directory)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

describe('AppDatabase migrations', () => {
  it('creates the current schema from an empty database', () => {
    withDirectory((directory) => {
      const database = new AppDatabase(directory)

      try {
        expect(tableNames(database)).toEqual(expect.arrayContaining(expectedTables))
        expect(appliedVersions(database)).toEqual(migrations.map((migration) => migration.version))
      } finally {
        database.close()
      }
    })
  })

  it('upgrades a version-2 database without losing user state', () => {
    withDirectory((directory) => {
      const databasePath = join(directory, 'app.db')
      const previous = new DatabaseSync(databasePath)

      try {
        previous.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')
        previous.exec(`
          CREATE TABLE schema_migrations (
            version INTEGER PRIMARY KEY,
            applied_at TEXT NOT NULL
          );
        `)

        for (const migration of migrations.filter((entry) => entry.version <= 2)) {
          previous.exec(migration.sql)
          previous
            .prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)')
            .run(migration.version, new Date().toISOString())
        }

        previous
          .prepare('INSERT INTO settings (key, value_json, updated_at) VALUES (?, ?, ?)')
          .run('app', JSON.stringify({ theme: 'dark' }), new Date().toISOString())
      } finally {
        previous.close()
      }

      const database = new AppDatabase(directory)

      try {
        expect(tableNames(database)).toEqual(expect.arrayContaining(expectedTables))
        expect(appliedVersions(database)).toEqual(migrations.map((migration) => migration.version))

        const row = database.connection
          .prepare("SELECT value_json FROM settings WHERE key = 'app'")
          .get() as { value_json?: string } | undefined

        expect(row?.value_json).toContain('"theme":"dark"')
      } finally {
        database.close()
      }
    })
  })
})
