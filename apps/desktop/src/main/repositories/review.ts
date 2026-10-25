import { randomUUID } from 'node:crypto'
import { createEmptyCard, fsrs, Rating, State } from 'ts-fsrs'
import type { Card, Grade } from 'ts-fsrs'
import type {
  ReviewCard,
  ReviewGrade,
  ReviewItemKind,
  ReviewPreview,
  ReviewState,
} from '../../shared/types'
import type { AppDatabase } from '../database'
import { startOfLocalDay } from '../time'

const scheduler = fsrs({ request_retention: 0.9, enable_short_term: true })

const gradeToRating: Record<ReviewGrade, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
}

const stateToName: Record<State, ReviewState> = {
  [State.New]: 'new',
  [State.Learning]: 'learning',
  [State.Review]: 'review',
  [State.Relearning]: 'relearning',
}

const nameToState: Record<ReviewState, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
}

interface ReviewCardRow {
  readonly id: string
  readonly item_kind: string
  readonly item_id: string
  readonly due_at: string
  readonly stability: number
  readonly difficulty: number
  readonly elapsed_days: number
  readonly scheduled_days: number
  readonly learning_steps: number
  readonly reps: number
  readonly lapses: number
  readonly state: string
  readonly last_reviewed_at: string | null
  readonly created_at: string
  readonly updated_at: string
}

export interface ReviewLimits {
  readonly dueLimit: number
  readonly newLimit: number
}

export interface ApplyAttemptInput {
  readonly problemId: string
  readonly mode: 'sample' | 'submit' | 'review'
  readonly status: string
  readonly hintsUsed: number
  readonly solutionViewed: boolean
}

export interface ReviewQueueCounts {
  readonly due: readonly ReviewCard[]
  readonly newCards: readonly ReviewCard[]
  readonly totalDue: number
  readonly totalNew: number
  readonly reviewedToday: number
  readonly nextDueAt: string | null
}

/**
 * Derives an FSRS grade from a submission. Sample runs never schedule a card;
 * review runs are graded explicitly by the learner so a single session cannot
 * count twice.
 */
export function deriveReviewRating(input: {
  readonly status: string
  readonly hintsUsed: number
  readonly solutionViewed: boolean
}): ReviewGrade {
  if (input.status !== 'accepted') {
    return 'again'
  }

  if (input.solutionViewed || input.hintsUsed >= 4) {
    return 'hard'
  }

  return input.hintsUsed > 0 ? 'good' : 'easy'
}

export class ReviewRepository {
  constructor(
    private readonly database: AppDatabase,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  ensureCard(itemKind: ReviewItemKind, itemId: string): ReviewCard {
    const existing = this.findCard(itemKind, itemId)

    if (existing) {
      return existing
    }

    const now = this.clock()
    const card = createEmptyCard(now)
    const id = randomUUID()

    this.database.connection
      .prepare(
        `INSERT INTO review_cards
         (id, item_kind, item_id, due_at, stability, difficulty, elapsed_days,
          scheduled_days, learning_steps, reps, lapses, state, last_reviewed_at,
          created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        itemKind,
        itemId,
        card.due.toISOString(),
        card.stability,
        card.difficulty,
        card.elapsed_days,
        card.scheduled_days,
        card.learning_steps,
        card.reps,
        card.lapses,
        stateToName[card.state],
        null,
        now.toISOString(),
        now.toISOString(),
      )

    return this.requireCard(id)
  }

  findCard(itemKind: ReviewItemKind, itemId: string): ReviewCard | null {
    const row = this.database.connection
      .prepare('SELECT * FROM review_cards WHERE item_kind = ? AND item_id = ?')
      .get(itemKind, itemId) as ReviewCardRow | undefined

    return row ? toReviewCard(row) : null
  }

  getCard(cardId: string): ReviewCard | null {
    const row = this.database.connection
      .prepare('SELECT * FROM review_cards WHERE id = ?')
      .get(cardId) as ReviewCardRow | undefined

    return row ? toReviewCard(row) : null
  }

  listCards(itemKind: ReviewItemKind): ReviewCard[] {
    const rows = this.database.connection
      .prepare('SELECT * FROM review_cards WHERE item_kind = ? ORDER BY due_at ASC')
      .all(itemKind) as unknown as ReviewCardRow[]

    return rows.map(toReviewCard)
  }

  /** Creates a card on the first submission and grades later submissions.
   * Sample runs are practice; review runs are graded explicitly. Leaving the
   * first card new puts it in the queue so the learner reviews it soon. */
  applyAttempt(input: ApplyAttemptInput): ReviewCard | null {
    if (input.mode !== 'submit') {
      return null
    }

    const existing = this.findCard('problem', input.problemId)

    if (!existing) {
      return this.ensureCard('problem', input.problemId)
    }

    return this.applyGrade(existing, deriveReviewRating(input))
  }

  review(cardId: string, grade: ReviewGrade): ReviewCard {
    return this.applyGrade(this.requireCard(cardId), grade)
  }

  preview(cardId: string): readonly ReviewPreview[] {
    const card = this.requireCard(cardId)
    const preview = scheduler.repeat(toFsrsCard(card), this.clock())

    return (['again', 'hard', 'good', 'easy'] as const).map((grade) => {
      const item = preview[gradeToRating[grade]]

      return {
        grade,
        dueAt: item.card.due.toISOString(),
        intervalDays: item.card.scheduled_days,
      }
    })
  }

  listQueue(limits: ReviewLimits): ReviewQueueCounts {
    const now = this.clock()
    const nowIso = now.toISOString()
    const dayStart = startOfLocalDay(now).toISOString()

    const due = this.database.connection
      .prepare(
        `SELECT * FROM review_cards
         WHERE state <> 'new' AND due_at <= ?
         ORDER BY due_at ASC
         LIMIT ?`,
      )
      .all(nowIso, limits.dueLimit) as unknown as ReviewCardRow[]

    const introducedToday = this.count(
      'SELECT COUNT(*) AS count FROM review_logs WHERE state_before = ? AND reviewed_at >= ?',
      'new',
      dayStart,
    )
    const newAllowance = Math.max(0, limits.newLimit - introducedToday)

    const newCards = this.database.connection
      .prepare(
        `SELECT * FROM review_cards
         WHERE state = 'new'
         ORDER BY created_at ASC, rowid ASC
         LIMIT ?`,
      )
      .all(newAllowance) as unknown as ReviewCardRow[]

    const next = this.database.connection
      .prepare(
        `SELECT MIN(due_at) AS next_due FROM review_cards
         WHERE state <> 'new' AND due_at > ?`,
      )
      .get(nowIso) as { next_due?: string | null } | undefined

    return {
      due: due.map(toReviewCard),
      newCards: newCards.map(toReviewCard),
      totalDue: this.count(
        "SELECT COUNT(*) AS count FROM review_cards WHERE state <> 'new' AND due_at <= ?",
        nowIso,
      ),
      totalNew: this.count("SELECT COUNT(*) AS count FROM review_cards WHERE state = 'new'"),
      reviewedToday: this.count(
        'SELECT COUNT(*) AS count FROM review_logs WHERE reviewed_at >= ?',
        dayStart,
      ),
      nextDueAt: next?.next_due ?? null,
    }
  }

  counts(now = this.clock()): {
    readonly dueCount: number
    readonly newCount: number
    readonly reviewedToday: number
    readonly reviewsCompleted: number
    readonly reviewsCompletedToday: number
  } {
    const nowIso = now.toISOString()
    const dayStart = startOfLocalDay(now).toISOString()

    return {
      dueCount: this.count(
        "SELECT COUNT(*) AS count FROM review_cards WHERE state <> 'new' AND due_at <= ?",
        nowIso,
      ),
      newCount: this.count("SELECT COUNT(*) AS count FROM review_cards WHERE state = 'new'"),
      reviewedToday: this.count(
        'SELECT COUNT(*) AS count FROM review_logs WHERE reviewed_at >= ?',
        dayStart,
      ),
      reviewsCompleted: this.count('SELECT COUNT(*) AS count FROM review_logs'),
      reviewsCompletedToday: this.count(
        'SELECT COUNT(*) AS count FROM review_logs WHERE reviewed_at >= ?',
        dayStart,
      ),
    }
  }

  private applyGrade(card: ReviewCard, grade: ReviewGrade): ReviewCard {
    const now = this.clock()
    const result = scheduler.next(toFsrsCard(card), now, gradeToRating[grade])
    const next = result.card

    this.database.connection
      .prepare(
        `UPDATE review_cards
         SET due_at = ?, stability = ?, difficulty = ?, elapsed_days = ?,
             scheduled_days = ?, learning_steps = ?, reps = ?, lapses = ?,
             state = ?, last_reviewed_at = ?, updated_at = ?
         WHERE id = ?`,
      )
      .run(
        next.due.toISOString(),
        next.stability,
        next.difficulty,
        next.elapsed_days,
        next.scheduled_days,
        next.learning_steps,
        next.reps,
        next.lapses,
        stateToName[next.state],
        now.toISOString(),
        now.toISOString(),
        card.id,
      )

    this.database.connection
      .prepare(
        `INSERT INTO review_logs
         (id, card_id, rating, state_before, state_after, due_at, reviewed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        randomUUID(),
        card.id,
        grade,
        card.state,
        stateToName[next.state],
        next.due.toISOString(),
        now.toISOString(),
      )

    return this.requireCard(card.id)
  }

  private requireCard(cardId: string): ReviewCard {
    const card = this.getCard(cardId)

    if (!card) {
      throw new Error('Review card not found.')
    }

    return card
  }

  private count(sql: string, ...parameters: (string | number)[]): number {
    const row = this.database.connection.prepare(sql).get(...parameters) as
      { count?: number } | undefined

    return Number(row?.count ?? 0)
  }
}

function toReviewCard(row: ReviewCardRow): ReviewCard {
  return {
    id: row.id,
    itemKind: row.item_kind === 'design' ? 'design' : 'problem',
    itemId: row.item_id,
    dueAt: row.due_at,
    stability: Number(row.stability),
    difficulty: Number(row.difficulty),
    elapsedDays: Number(row.elapsed_days),
    scheduledDays: Number(row.scheduled_days),
    learningSteps: Number(row.learning_steps),
    reps: Number(row.reps),
    lapses: Number(row.lapses),
    state: isReviewState(row.state) ? row.state : 'new',
    lastReviewedAt: row.last_reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toFsrsCard(card: ReviewCard): Card {
  return {
    due: new Date(card.dueAt),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsedDays,
    scheduled_days: card.scheduledDays,
    learning_steps: card.learningSteps,
    reps: card.reps,
    lapses: card.lapses,
    state: nameToState[card.state],
    ...(card.lastReviewedAt ? { last_review: new Date(card.lastReviewedAt) } : {}),
  }
}

function isReviewState(value: string): value is ReviewState {
  return value === 'new' || value === 'learning' || value === 'review' || value === 'relearning'
}
