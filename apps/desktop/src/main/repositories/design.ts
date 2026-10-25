import { randomUUID } from 'node:crypto'
import { emptyDesignNotes } from '../../shared/types'
import type {
  DesignAttemptDetail,
  DesignAttemptSummary,
  DesignDraft,
  DesignNotes,
  DesignRubricAnswers,
  DesignScenePayload,
  SaveDesignDraftInput,
  SubmitDesignInput,
} from '../../shared/types'
import type { AppDatabase } from '../database'

interface DesignAttemptRow {
  readonly id: string
  readonly scenario_id: string
  readonly scene_json: string
  readonly notes_json: string
  readonly rubric_json: string
  readonly status: string
  readonly created_at: string
  readonly updated_at: string
}

function draftId(scenarioId: string): string {
  return `draft:${scenarioId}`
}

function averageScore(rubric: DesignRubricAnswers): number | null {
  const scores = Object.values(rubric)
    .map((answer) => answer.score)
    .filter((score) => Number.isFinite(score) && score >= 1)

  if (scores.length === 0) {
    return null
  }

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
  return Math.round(average * 10) / 10
}

function parseNotes(raw: string): DesignNotes {
  try {
    const parsed = JSON.parse(raw) as Partial<DesignNotes>
    const notes = { ...emptyDesignNotes }

    for (const key of Object.keys(emptyDesignNotes) as (keyof DesignNotes)[]) {
      const value = parsed[key]
      notes[key] = typeof value === 'string' ? value : ''
    }

    return notes
  } catch {
    return { ...emptyDesignNotes }
  }
}

function parseRubric(raw: string): DesignRubricAnswers {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const rubric: DesignRubricAnswers = {}

    for (const [dimensionId, value] of Object.entries(parsed)) {
      if (!value || typeof value !== 'object') {
        continue
      }

      const answer = value as { score?: unknown; evidence?: unknown }
      const score = Number(answer.score)

      if (!Number.isInteger(score) || score < 1 || score > 4) {
        continue
      }

      rubric[dimensionId] = {
        score,
        evidence: typeof answer.evidence === 'string' ? answer.evidence : '',
      }
    }

    return rubric
  } catch {
    return {}
  }
}

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

  getDraft(scenarioId: string): DesignDraft {
    const row = this.database.connection
      .prepare('SELECT * FROM design_attempts WHERE id = ?')
      .get(draftId(scenarioId)) as DesignAttemptRow | undefined

    if (!row) {
      return {
        scenarioId,
        sceneJson: '',
        notes: { ...emptyDesignNotes },
        rubric: {},
        updatedAt: null,
      }
    }

    return {
      scenarioId,
      sceneJson: row.scene_json,
      notes: parseNotes(row.notes_json),
      rubric: parseRubric(row.rubric_json),
      updatedAt: row.updated_at,
    }
  }

  saveDraft(input: SaveDesignDraftInput): DesignDraft {
    const existing = this.getDraft(input.scenarioId)
    const now = new Date().toISOString()
    const sceneJson = input.sceneJson ?? existing.sceneJson
    const notes = input.notes ?? existing.notes
    const rubric = input.rubric ?? existing.rubric

    this.database.connection
      .prepare(
        `INSERT INTO design_attempts
         (id, scenario_id, scene_json, notes_json, rubric_json, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'draft', ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           scene_json = excluded.scene_json,
           notes_json = excluded.notes_json,
           rubric_json = excluded.rubric_json,
           updated_at = excluded.updated_at`,
      )
      .run(
        draftId(input.scenarioId),
        input.scenarioId,
        sceneJson,
        JSON.stringify(notes),
        JSON.stringify(rubric),
        now,
        now,
      )

    return {
      scenarioId: input.scenarioId,
      sceneJson,
      notes,
      rubric,
      updatedAt: now,
    }
  }

  submit(input: SubmitDesignInput): DesignAttemptSummary {
    const id = randomUUID()
    const now = new Date().toISOString()

    this.database.connection
      .prepare(
        `INSERT INTO design_attempts
         (id, scenario_id, scene_json, notes_json, rubric_json, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'submitted', ?, ?)`,
      )
      .run(
        id,
        input.scenarioId,
        input.sceneJson,
        JSON.stringify(input.notes),
        JSON.stringify(input.rubric),
        now,
        now,
      )

    return {
      id,
      scenarioId: input.scenarioId,
      status: 'submitted',
      averageScore: averageScore(input.rubric),
      createdAt: now,
      updatedAt: now,
    }
  }

  listAttempts(scenarioId: string): DesignAttemptSummary[] {
    const rows = this.database.connection
      .prepare(
        `SELECT * FROM design_attempts
         WHERE scenario_id = ? AND status = 'submitted'
         ORDER BY created_at DESC, rowid DESC`,
      )
      .all(scenarioId) as unknown as DesignAttemptRow[]

    return rows.map((row) => ({
      id: row.id,
      scenarioId: row.scenario_id,
      status: row.status,
      averageScore: averageScore(parseRubric(row.rubric_json)),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  }

  getAttempt(attemptId: string): DesignAttemptDetail {
    const row = this.database.connection
      .prepare("SELECT * FROM design_attempts WHERE id = ? AND status = 'submitted'")
      .get(attemptId) as DesignAttemptRow | undefined

    if (!row) {
      throw new Error('Design attempt not found.')
    }

    const rubric = parseRubric(row.rubric_json)

    return {
      id: row.id,
      scenarioId: row.scenario_id,
      status: row.status,
      averageScore: averageScore(rubric),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      sceneJson: row.scene_json,
      notes: parseNotes(row.notes_json),
      rubric,
    }
  }
}
