import { useCallback, useEffect, useState } from 'react'
import type { JSX } from 'react'
import type { ReviewGrade, ReviewQueue, ReviewQueueItem } from '../../../shared/types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

const gradeLabels: Record<ReviewGrade, string> = {
  again: 'Again',
  hard: 'Hard',
  good: 'Good',
  easy: 'Easy',
}

const grades: readonly ReviewGrade[] = ['again', 'hard', 'good', 'easy']

interface ReviewViewProps {
  readonly onStartReview: (problemId: string, cardId: string) => void
}

export function ReviewView({ onStartReview }: ReviewViewProps): JSX.Element {
  const [queue, setQueue] = useState<ReviewQueue | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [grading, setGrading] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback((): void => {
    setError(null)

    void window.baseCase.review
      .queue()
      .then((nextQueue) => {
        setQueue(nextQueue)
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : String(loadError))
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const grade = async (cardId: string, rating: ReviewGrade): Promise<void> => {
    setGrading(cardId)
    setError(null)
    setMessage(null)

    try {
      const result = await window.baseCase.review.grade({ cardId, grade: rating })
      setMessage(`Scheduled next review for ${formatDue(result.card.dueAt)}.`)
      load()
    } catch (gradeError: unknown) {
      setError(gradeError instanceof Error ? gradeError.message : String(gradeError))
    } finally {
      setGrading(null)
    }
  }

  if (error && !queue) {
    return (
      <div className="callout callout-error">
        <strong>Could not load the review queue.</strong>
        <p>{error}</p>
      </div>
    )
  }

  if (!queue) {
    return <p className="muted">Loading the review queue…</p>
  }

  const total = queue.due.length + queue.newCards.length

  return (
    <div className="workspace-stack">
      <div className="card-grid">
        <section className="card">
          <h2>Due now</h2>
          <p className="metric">{queue.totalDue}</p>
          <p>
            Reviews shown: {queue.due.length} of {queue.dueLimit} daily limit.
          </p>
        </section>
        <section className="card">
          <h2>New cards</h2>
          <p className="metric">{queue.totalNew}</p>
          <p>
            {queue.newCards.length} available today · limit {queue.newLimit}.
          </p>
        </section>
        <section className="card">
          <h2>Reviewed today</h2>
          <p className="metric">{queue.reviewedToday}</p>
          <p>
            {queue.nextDueAt
              ? `Next scheduled review ${formatDue(queue.nextDueAt)}.`
              : 'Nothing scheduled ahead yet.'}
          </p>
        </section>
      </div>

      {message ? (
        <div className="callout" data-testid="review-message">
          <p>{message}</p>
        </div>
      ) : null}

      {error ? (
        <div className="callout callout-error">
          <p>{error}</p>
        </div>
      ) : null}

      {total === 0 ? (
        <section className="empty-state" data-testid="review-empty">
          <h2>Nothing is due</h2>
          <p>
            Submit a solution or grade a design attempt to create a card. Cards return when the
            scheduler predicts you are about to forget the approach.
          </p>
          {queue.nextDueAt ? (
            <p className="hint">Next review {formatDue(queue.nextDueAt)}.</p>
          ) : null}
        </section>
      ) : (
        <>
          {queue.due.length > 0 ? (
            <ReviewSection
              title="Due now"
              items={queue.due}
              grading={grading}
              onStartReview={onStartReview}
              onGrade={grade}
            />
          ) : null}

          {queue.newCards.length > 0 ? (
            <ReviewSection
              title="New"
              items={queue.newCards}
              grading={grading}
              onStartReview={onStartReview}
              onGrade={grade}
            />
          ) : null}
        </>
      )}
    </div>
  )
}

function ReviewSection({
  title,
  items,
  grading,
  onStartReview,
  onGrade,
}: {
  readonly title: string
  readonly items: readonly ReviewQueueItem[]
  readonly grading: string | null
  readonly onStartReview: (problemId: string, cardId: string) => void
  readonly onGrade: (cardId: string, grade: ReviewGrade) => Promise<void>
}): JSX.Element {
  return (
    <section className="review-section">
      <div className="list-toolbar">
        <div>
          <h2>{title}</h2>
          <p className="muted">
            {items.length} {items.length === 1 ? 'card' : 'cards'}
          </p>
        </div>
      </div>

      <ul className="review-list">
        {items.map((item) => (
          <li key={item.id} className="review-item" data-testid="review-item">
            <div className="review-item-main">
              <div className="review-item-heading">
                <strong>{item.title}</strong>
                <Badge tone={item.state === 'new' ? 'neutral' : 'success'}>
                  {item.state === 'new' ? 'New' : formatDue(item.dueAt)}
                </Badge>
              </div>
              <p className="muted">
                {item.subtitle} · {item.reps} {item.reps === 1 ? 'review' : 'reviews'}
                {item.lapses > 0 ? ` · ${item.lapses} lapses` : ''}
              </p>
              <div className="review-preview-row">
                {grades.map((grade) => {
                  const preview = item.previews.find((entry) => entry.grade === grade)

                  return (
                    <span key={grade} className="review-preview">
                      <span>{gradeLabels[grade]}</span>
                      <span className="review-preview-interval">
                        {preview ? formatInterval(preview.dueAt) : '—'}
                      </span>
                    </span>
                  )
                })}
              </div>
            </div>

            <div className="review-item-actions">
              {item.itemKind === 'problem' ? (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onStartReview(item.itemId, item.id)}
                  data-testid="start-review"
                >
                  Review problem
                </Button>
              ) : (
                <span className="muted review-design-note">
                  Design review workspace arrives in Phase 5.
                </span>
              )}

              <div className="review-grade-row">
                {grades.map((grade) => (
                  <Button
                    key={grade}
                    size="sm"
                    variant="ghost"
                    disabled={grading !== null}
                    onClick={() => void onGrade(item.id, grade)}
                    data-testid={`grade-${grade}`}
                  >
                    {gradeLabels[grade]}
                  </Button>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function formatDue(dueAt: string): string {
  const difference = new Date(dueAt).getTime() - Date.now()

  if (difference <= 0) {
    return 'Due now'
  }

  return `in ${formatDuration(difference)}`
}

function formatInterval(dueAt: string): string {
  const difference = new Date(dueAt).getTime() - Date.now()
  return difference <= 0 ? 'now' : formatDuration(difference)
}

function formatDuration(milliseconds: number): string {
  const minutes = Math.max(1, Math.round(milliseconds / 60_000))

  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.round(minutes / 60)
  return hours < 24 ? `${hours}h` : `${Math.round(hours / 24)}d`
}
