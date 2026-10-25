import type { DesignScenePayload } from '../../shared/types'
import type { AppDatabase } from '../database'

/** The Phase 1 sandbox scene. Design attempts get their own table later. */
export class DesignRepository {
  constructor(private readonly database: AppDatabase) {}

  getScene(): DesignScenePayload {
    const row = this.database.connection
      .prepare("SELECT scene_json, updated_at FROM design_scenes WHERE id = 'sandbox'")
      .get() as { scene_json?: string; updated_at?: string } | undefined

    return {
      sceneJson: row?.scene_json ?? null,
      updatedAt: row?.updated_at ?? null,
    }
  }

  saveScene(sceneJson: string): void {
    const now = new Date().toISOString()
    this.database.connection
      .prepare(
        `INSERT INTO design_scenes (id, scene_json, updated_at)
         VALUES ('sandbox', ?, ?)
         ON CONFLICT(id)
         DO UPDATE SET scene_json = excluded.scene_json, updated_at = excluded.updated_at`,
      )
      .run(sceneJson, now)
  }
}
