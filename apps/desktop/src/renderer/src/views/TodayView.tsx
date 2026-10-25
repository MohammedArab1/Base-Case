import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import type { ProblemSummary, SectionId, TodaySummary } from '../../../shared/types'

interface TodayViewProps {
  readonly problems: readonly ProblemSummary[]
  readonly onOpenProblem: (problemId: string) => void
  readonly onNavigate: (section: SectionId) => void
}

export function TodayView({ problems, onOpenProblem, onNavigate }: TodayViewProps): JSX.Element {
  const [summary, setSummary] = useState<TodaySummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void window.baseCase.progress
      .today()
      .then((nextSummary) => {
        if (!cancelled) {
          setSummary(nextSummary)
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : String(loadError))
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const continueProblem = summary?.continueProblemId
    ? problems.find((problem) => problem.id === summary.continueProblemId)
    : undefined
  const fallbackProblem = continueProblem ?? problems[0]
  const dueTotal = summary ? summary.dueCount + summary.newCount : 0

  return (
    <div className="workspace-stack">
      {error ? (
        <div className="callout callout-error">
          <strong>Could not load today&apos;s summary.</strong>
          <p>{error}</p>
        </div>
      ) : null}

      <div className="card-grid">
        <section className="card">
          <h2>Review queue</h2>
          <p className="metric">{summary ? dueTotal : '—'}</p>
          <p>
            {summary
              ? `${summary.dueCount} due · ${summary.newCount} new · ${summary.reviewedToday} reviewed today`
              : 'Reading your local review schedule.'}
          </p>
          <button type="button" className="text-button" onClick={() => onNavigate('review')}>
            Open Review
          </button>
        </section>

        <section className="card">
          <h2>Continue</h2>
          <p>
            {fallbackProblem
              ? continueProblem
                ? `Pick up ${fallbackProblem.title} where you left off.`
                : `Start with ${fallbackProblem.title} and run the sample tests.`
              : 'No problem is loaded yet.'}
          </p>
          <button
            type="button"
            className="text-button"
            disabled={!fallbackProblem}
            onClick={() => {
              if (fallbackProblem) {
                onOpenProblem(fallbackProblem.id)
              }
            }}
          >
            {fallbackProblem ? 'Open coding workspace' : 'No problems'}
          </button>
        </section>

        <section className="card">
          <h2>Today</h2>
          <p className="metric">
            {summary ? `${summary.attemptsToday}` : '—'}
            <span className="metric-unit"> attempts</span>
          </p>
          <p>
            {summary
              ? `${summary.acceptedToday} accepted · ${summary.streakDays}-day streak · goal ${summary.dailyGoalMinutes} min`
              : 'Your first run starts the history.'}
          </p>
          <button type="button" className="text-button" onClick={() => onNavigate('progress')}>
            View progress
          </button>
        </section>
      </div>

      <section className="empty-state">
        <div className="empty-illustration" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h2>Attempt → failure → explanation → fix → review</h2>
        <p>
          Submit a solution to schedule its first review. Miss a problem and the card comes back
          sooner; solve it cleanly and the interval grows.
        </p>
        <p className="hint">
          Hints and solutions are hidden in review mode. Everything is stored locally.
        </p>
      </section>
    </div>
  )
}
