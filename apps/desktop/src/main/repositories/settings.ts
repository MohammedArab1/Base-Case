import type { AppDatabase } from '../database'

/** Key/value storage for application preferences. Secrets are not stored here. */
export class SettingsRepository {
  constructor(private readonly database: AppDatabase) {}

  get(key: string): string | null {
    const row = this.database.connection
      .prepare('SELECT value_json FROM settings WHERE key = ?')
      .get(key) as { value_json?: string } | undefined

    return row?.value_json ?? null
  }

  set(key: string, valueJson: string): void {
    const now = new Date().toISOString()
    this.database.connection
      .prepare(
        `INSERT INTO settings (key, value_json, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(key)
         DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at`,
      )
      .run(key, valueJson, now)
  }

  remove(key: string): void {
    this.database.connection.prepare('DELETE FROM settings WHERE key = ?').run(key)
  }
}
