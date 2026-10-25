import { randomUUID } from 'node:crypto'
import type { AiFeature, AiFeedbackReason } from '../../shared/types'
import type { AppDatabase } from '../database'

export interface AiFeedbackRow {
  readonly id: string
  readonly feature: AiFeature
  readonly provider_type: string
  readonly model: string
  readonly reason: AiFeedbackReason
  readonly comment: string | null
  readonly created_at: string
}

export interface AddAiFeedbackInput {
  readonly feature: AiFeature
  readonly reason: AiFeedbackReason
  readonly comment?: string
  readonly providerType: string
  readonly model: string
}

/** Local-only AI feedback. Nothing here is sent anywhere. */
export class AiFeedbackRepository {
  constructor(private readonly database: AppDatabase) {}

  add(input: AddAiFeedbackInput): void {
    this.database.connection
      .prepare(
        `INSERT INTO ai_feedback
         (id, feature, provider_type, model, reason, comment, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        randomUUID(),
        input.feature,
        input.providerType,
        input.model,
        input.reason,
        input.comment?.trim() || null,
        new Date().toISOString(),
      )
  }

  list(limit = 100): AiFeedbackRow[] {
    return this.database.connection
      .prepare(
        `SELECT id, feature, provider_type, model, reason, comment, created_at
         FROM ai_feedback
         ORDER BY created_at DESC
         LIMIT ?`,
      )
      .all(Math.max(1, Math.min(500, limit))) as unknown as AiFeedbackRow[]
  }
}
