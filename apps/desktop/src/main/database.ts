import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import type { AiProviderType, DesignScenePayload, RunResult, Stats } from '../shared/types'

export interface ProviderRow {
  readonly type: AiProviderType
  readonly base_url: string
  readonly model: string
  readonly key_ref: string | null
  readonly enabled: number
}

const migrations = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attempts (
        id TEXT PRIMARY KEY,
        problem_id TEXT NOT NULL,
        language TEXT NOT NULL,
        mode TEXT NOT NULL,
        code TEXT NOT NULL,
        status TEXT NOT NULL,
        passed INTEGER NOT NULL,
        total INTEGER NOT NULL,
        result_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS attempts_problem_created
        ON attempts (problem_id, created_at);

      CREATE TABLE IF NOT EXISTS drafts (
        problem_id TEXT NOT NULL,
        language TEXT NOT NULL,
        code TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (problem_id, language)
      );

      CREATE TABLE IF NOT EXISTS design_scenes (
        id TEXT PRIMARY KEY,
        scene_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ai_provider_configs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        base_url TEXT NOT NULL,
        model TEXT NOT NULL,
        key_ref TEXT,
        enabled INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `,
  },
]

export class AppDatabase {
  readonly path: string
  private readonly db: DatabaseSync

  constructor(userDataPath: string) {
    mkdirSync(userDataPath, { recursive: true })
    this.path = join(userDataPath, 'app.db')
    this.db = new DatabaseSync(this.path)
    this.db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')
    this.runMigrations()
    this.backupIfPossible(userDataPath)
  }

  close(): void {
    this.db.close()
  }

  getDraft(problemId: string, language: string): string | null {
    const row = this.db
      .prepare('SELECT code FROM drafts WHERE problem_id = ? AND language = ?')
      .get(problemId, language) as { code?: string } | undefined

    return row?.code ?? null
  }

  saveDraft(problemId: string, language: string, code: string): void {
    const now = new Date().toISOString()
    this.db
      .prepare(
        `INSERT INTO drafts (problem_id, language, code, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(problem_id, language)
         DO UPDATE SET code = excluded.code, updated_at = excluded.updated_at`,
      )
      .run(problemId, language, code, now)
  }

  saveAttempt(input: {
    problemId: string
    language: string
    mode: string
    code: string
    result: RunResult
  }): string {
    const id = randomUUID()
    const createdAt = new Date().toISOString()

    this.db
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
    const row = this.db
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

  saveDesignScene(sceneJson: string): void {
    const now = new Date().toISOString()
    this.db
      .prepare(
        `INSERT INTO design_scenes (id, scene_json, updated_at)
         VALUES ('sandbox', ?, ?)
         ON CONFLICT(id)
         DO UPDATE SET scene_json = excluded.scene_json, updated_at = excluded.updated_at`,
      )
      .run(sceneJson, now)
  }

  getDesignScene(): DesignScenePayload {
    const row = this.db
      .prepare("SELECT scene_json, updated_at FROM design_scenes WHERE id = 'sandbox'")
      .get() as { scene_json?: string; updated_at?: string } | undefined

    return {
      sceneJson: row?.scene_json ?? null,
      updatedAt: row?.updated_at ?? null,
    }
  }

  getSetting(key: string): string | null {
    const row = this.db.prepare('SELECT value_json FROM settings WHERE key = ?').get(key) as
      { value_json?: string } | undefined

    return row?.value_json ?? null
  }

  setSetting(key: string, valueJson: string): void {
    const now = new Date().toISOString()
    this.db
      .prepare(
        `INSERT INTO settings (key, value_json, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(key)
         DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at`,
      )
      .run(key, valueJson, now)
  }

  deleteSetting(key: string): void {
    this.db.prepare('DELETE FROM settings WHERE key = ?').run(key)
  }

  getProviderConfig(): ProviderRow | null {
    const row = this.db
      .prepare(
        `SELECT type, base_url, model, key_ref, enabled
         FROM ai_provider_configs WHERE id = 'default'`,
      )
      .get() as ProviderRow | undefined

    return row ?? null
  }

  saveProviderConfig(input: {
    type: AiProviderType
    baseUrl: string
    model: string
    keyRef: string | null
    enabled: boolean
  }): void {
    const now = new Date().toISOString()
    this.db
      .prepare(
        `INSERT INTO ai_provider_configs
         (id, name, type, base_url, model, key_ref, enabled, created_at, updated_at)
         VALUES ('default', 'Default provider', ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id)
         DO UPDATE SET
           type = excluded.type,
           base_url = excluded.base_url,
           model = excluded.model,
           key_ref = excluded.key_ref,
           enabled = excluded.enabled,
           updated_at = excluded.updated_at`,
      )
      .run(input.type, input.baseUrl, input.model, input.keyRef, input.enabled ? 1 : 0, now, now)
  }

  private runMigrations(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `)

    const appliedRows = this.db.prepare('SELECT version FROM schema_migrations').all() as {
      version: number
    }[]
    const applied = new Set(appliedRows.map((row) => Number(row.version)))

    for (const migration of migrations) {
      if (applied.has(migration.version)) {
        continue
      }

      this.db.exec('BEGIN')
      try {
        this.db.exec(migration.sql)
        this.db
          .prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)')
          .run(migration.version, new Date().toISOString())
        this.db.exec('COMMIT')
      } catch (error) {
        this.db.exec('ROLLBACK')
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

      this.db.exec(`VACUUM INTO '${escapedPath}'`)

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
