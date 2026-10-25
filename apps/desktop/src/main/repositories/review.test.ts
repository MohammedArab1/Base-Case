import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AppDatabase } from '../database'
import { deriveReviewRating, ReviewRepository } from './review'

function withReview(run: (review: ReviewRepository, setNow: (date: Date) => void) => void): void {
  const directory = mkdtempSync(join(tmpdir(), 'base-case-review-'))
  const database = new AppDatabase(directory)
  let now = new Date('2026-01-05T09:00:00.000Z')

  try {
    run(new ReviewRepository(database, () => now), (date) => {
      now = date
    })
  } finally {
    database.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

describe('deriveReviewRating', () => {
  it('maps outcomes and hint usage to a grade', () => {
    expect(
      deriveReviewRating({ status: 'wrong_answer', hintsUsed: 0, solutionViewed: false }),
    ).toBe('again')
    expect(deriveReviewRating({ status: 'accepted', hintsUsed: 0, solutionViewed: false })).toBe(
      'easy',
    )
    expect(deriveReviewRating({ status: 'accepted', hintsUsed: 2, solutionViewed: false })).toBe(
      'good',
    )
    expect(deriveReviewRating({ status: 'accepted', hintsUsed: 4, solutionViewed: false })).toBe(
      'hard',
    )
    expect(deriveReviewRating({ status: 'accepted', hintsUsed: 0, solutionViewed: true })).toBe(
      'hard',
    )
  })
})

describe('ReviewRepository', () => {
  it('ignores sample runs and creates a card on the first submission', () => {
    withReview((review) => {
      expect(
        review.applyAttempt({
          problemId: 'core/pair-sum',
          mode: 'sample',
          status: 'accepted',
          hintsUsed: 0,
          solutionViewed: false,
        }),
      ).toBeNull()

      expect(review.findCard('problem', 'core/pair-sum')).toBeNull()

      const card = review.applyAttempt({
        problemId: 'core/pair-sum',
        mode: 'submit',
        status: 'accepted',
        hintsUsed: 0,
        solutionViewed: false,
      })

      expect(card).not.toBeNull()
      expect(card?.itemId).toBe('core/pair-sum')
      expect(card?.reps).toBe(0)
      expect(card?.state).toBe('new')
      expect(card?.dueAt).toEqual(expect.any(String))
    })
  })

  it('does not auto-grade review-mode attempts', () => {
    withReview((review) => {
      expect(
        review.applyAttempt({
          problemId: 'core/pair-sum',
          mode: 'review',
          status: 'accepted',
          hintsUsed: 0,
          solutionViewed: false,
        }),
      ).toBeNull()
    })
  })

  it('updates the same card on repeated submissions and logs each review', () => {
    withReview((review, setNow) => {
      const first = review.applyAttempt({
        problemId: 'core/pair-sum',
        mode: 'submit',
        status: 'wrong_answer',
        hintsUsed: 0,
        solutionViewed: false,
      })

      setNow(new Date('2026-01-05T09:10:00.000Z'))

      const second = review.applyAttempt({
        problemId: 'core/pair-sum',
        mode: 'submit',
        status: 'accepted',
        hintsUsed: 1,
        solutionViewed: false,
      })

      setNow(new Date('2026-01-05T09:20:00.000Z'))

      const third = review.applyAttempt({
        problemId: 'core/pair-sum',
        mode: 'submit',
        status: 'accepted',
        hintsUsed: 0,
        solutionViewed: false,
      })

      expect(second?.id).toBe(first?.id)
      expect(second?.reps).toBe(1)
      expect(third?.reps).toBe(2)
      expect(review.counts().reviewsCompleted).toBe(2)
    })
  })

  it('schedules manual grades and reports the next due previews', () => {
    withReview((review) => {
      const card = review.ensureCard('problem', 'core/pair-sum')
      const graded = review.review(card.id, 'good')

      expect(graded.reps).toBe(1)
      expect(graded.state).not.toBe('new')
      expect(graded.learningSteps).toBeGreaterThanOrEqual(0)

      const previews = review.preview(card.id)
      expect(previews.map((preview) => preview.grade)).toEqual(['again', 'hard', 'good', 'easy'])
      expect(previews.every((preview) => Number.isFinite(Date.parse(preview.dueAt)))).toBe(true)
    })
  })

  it('orders due cards and applies the daily limits', () => {
    withReview((review, setNow) => {
      for (const problemId of ['core/a', 'core/b', 'core/c']) {
        review.ensureCard('problem', problemId)
      }

      const queue = review.listQueue({ dueLimit: 2, newLimit: 1 })
      expect(queue.totalNew).toBe(3)
      expect(queue.newCards).toHaveLength(1)

      // Introduce one new card, then the daily new allowance is exhausted.
      review.review(queue.newCards[0]!.id, 'again')
      expect(review.listQueue({ dueLimit: 2, newLimit: 1 }).newCards).toHaveLength(0)

      // Move past the learning step so the reviewed card becomes due.
      setNow(new Date('2026-01-05T10:00:00.000Z'))
      const due = review.listQueue({ dueLimit: 2, newLimit: 1 })
      expect(due.totalDue).toBe(1)
      expect(due.due).toHaveLength(1)
      expect(due.nextDueAt).toBeNull()
    })
  })
})
