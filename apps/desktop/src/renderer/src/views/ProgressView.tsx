import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import type { ProgressSummary } from '../../../shared/types'
import { Badge } from '../ui/Badge'

interface ProgressViewProps {
  readonly onOpenProblem: (problemId: string) => void
}

export function ProgressView({ onOpenProblem }: ProgressViewProps): JSX.Element {
  const [summary, setSummary] = useState<ProgressSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void window.baseCase.progress
      .summary()
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

  if (error) {
    return (
      <div className="callout callout-error" role="alert">
        <strong>Could not load progress.</strong>
        <p>{error}</p>
      </div>
    )
  }

  if (!summary) {
    return <p className="muted">Reading local progress…</p>
  }

  const activityMax = Math.max(1, ...summary.dailyActivity.map((day) => day.attempts))
  const activityTotal = summary.dailyActivity.reduce((total, day) => total + day.attempts, 0)

  return (
    <div className="workspace-stack">
      <div className="card-grid">
        <section className="card">
          <h2>Attempts</h2>
          <p className="metric">{summary.attempts}</p>
          <p>Sample runs, submissions, and reviews stored in SQLite.</p>
        </section>
        <section className="card">
          <h2>Accepted</h2>
          <p className="metric">{summary.accepted}</p>
          <p>Attempts that passed every test.</p>
        </section>
        <section className="card">
          <h2>Streak</h2>
          <p className="metric">
            {summary.streakDays}
            <span className="metric-unit"> days</span>
          </p>
          <p>Consecutive local days with at least one attempt.</p>
        </section>
        <section className="card">
          <h2>Reviews</h2>
          <p className="metric">{summary.reviewsCompleted}</p>
          <p>
            {summary.reviewsDue} queued · {summary.reviewsCompletedToday} completed today.
          </p>
        </section>
      </div>

      <section className="card">
        <h2>Activity</h2>
        <p>Attempts per local day over the last 14 days.</p>
        <div
          className="activity-chart"
          role="group"
          aria-label="Attempts per day for the last 14 days"
        >
          {summary.dailyActivity.map((day) => (
            <div className="activity-column" key={day.day}>
              <span className="activity-track" aria-hidden="true">
                <span
                  className="activity-bar"
                  style={{
                    height: `${Math.max(2, Math.round((day.attempts / activityMax) * 100))}%`,
                  }}
                />
              </span>
              <span className="activity-label" aria-hidden="true">
                {day.day.slice(5)}
              </span>
              <span className="sr-only">
                {day.day}: {day.attempts} attempts, {day.accepted} accepted
              </span>
            </div>
          ))}
        </div>
        <p className="muted">{activityTotal} attempts in this window.</p>
      </section>

      <section className="card">
        <h2>Pattern coverage</h2>
        {summary.patterns.length === 0 ? (
          <p>No patterns are loaded yet.</p>
        ) : (
          <ul className="progress-list" data-testid="pattern-progress">
            {summary.patterns.map((pattern) => (
              <li key={pattern.pattern} className="progress-row">
                <span className="progress-label">{pattern.pattern}</span>
                <span className="progress-bar" aria-hidden="true">
                  <span
                    className="progress-bar-fill"
                    style={{
                      width: `${pattern.problems === 0 ? 0 : Math.round((pattern.attempted / pattern.problems) * 100)}%`,
                    }}
                  />
                </span>
                <span className="progress-count">
                  {pattern.attempted}/{pattern.problems} attempted · {pattern.accepted} accepted
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Mistake tags</h2>
        {summary.mistakes.length === 0 ? (
          <p>
            No mistakes tagged yet. Open an attempt in the Inspector&apos;s History tab and add a
            tag after a failed run.
          </p>
        ) : (
          <ul className="progress-list" data-testid="mistake-progress">
            {summary.mistakes.map((mistake) => (
              <li key={mistake.tagId} className="progress-row">
                <span className="progress-label">{mistake.label}</span>
                <span className="progress-count">{mistake.count} tagged</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Recent attempts</h2>
        {summary.recentAttempts.length === 0 ? (
          <p>No attempts yet. Your first sample run starts the history.</p>
        ) : (
          <ul className="attempt-list" data-testid="recent-attempts">
            {summary.recentAttempts.map((attempt) => (
              <li key={attempt.id} className="attempt-list-row">
                <button
                  type="button"
                  className="text-button"
                  onClick={() => onOpenProblem(attempt.problemId)}
                >
                  {attempt.problemId}
                </button>
                <Badge tone={attempt.status === 'accepted' ? 'success' : 'neutral'}>
                  {attempt.status.replaceAll('_', ' ')}
                </Badge>
                <span className="muted">
                  {attempt.mode} · {attempt.language} · {attempt.passed}/{attempt.total}
                </span>
                <span className="muted">{new Date(attempt.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
