import type { AiProviderType } from '../../shared/types'
import type { AppDatabase } from '../database'

export interface ProviderRow {
  readonly type: AiProviderType
  readonly base_url: string
  readonly model: string
  readonly key_ref: string | null
  readonly headers_json: string
  readonly enabled: number
}

export interface SaveProviderConfigInput {
  readonly type: AiProviderType
  readonly baseUrl: string
  readonly model: string
  readonly keyRef: string | null
  readonly headers: Readonly<Record<string, string>>
  readonly enabled: boolean
}

/** Provider metadata only. Encrypted keys live in settings. */
export class AiProviderRepository {
  constructor(private readonly database: AppDatabase) {}

  getConfig(): ProviderRow | null {
    const row = this.database.connection
      .prepare(
        `SELECT type, base_url, model, key_ref, headers_json, enabled
         FROM ai_provider_configs WHERE id = 'default'`,
      )
      .get() as ProviderRow | undefined

    return row ?? null
  }

  saveConfig(input: SaveProviderConfigInput): void {
    const now = new Date().toISOString()
    this.database.connection
      .prepare(
        `INSERT INTO ai_provider_configs
         (id, name, type, base_url, model, key_ref, headers_json, enabled, created_at, updated_at)
         VALUES ('default', 'Default provider', ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id)
         DO UPDATE SET
           type = excluded.type,
           base_url = excluded.base_url,
           model = excluded.model,
           key_ref = excluded.key_ref,
           headers_json = excluded.headers_json,
           enabled = excluded.enabled,
           updated_at = excluded.updated_at`,
      )
      .run(
        input.type,
        input.baseUrl,
        input.model,
        input.keyRef,
        JSON.stringify(input.headers),
        input.enabled ? 1 : 0,
        now,
        now,
      )
  }
}
