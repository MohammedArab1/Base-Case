import type { JSX } from 'react'
import type { AttemptMode, RunResult } from '../../../shared/types'

interface ResultsPanelProps {
  readonly result: RunResult | null
  readonly running: boolean
  readonly error: string | null
  readonly mode: AttemptMode
  readonly onExplain?: () => void
}

const statusLabels: Record<string, string> = {
  accepted: 'Accepted',
  wrong_answer: 'Wrong answer',
  compile_error: 'Compile error',
  runtime_error: 'Runtime error',
  time_limit_exceeded: 'Time limit exceeded',
  memory_limit_exceeded: 'Memory limit exceeded',
  output_limit_exceeded: 'Output limit exceeded',
  internal_error: 'Internal error',
  cancelled: 'Cancelled',
}

function statusLabel(status: string): string {
  return statusLabels[status] ?? status.replaceAll('_', ' ')
}

function statusTone(status: string): string {
  if (status === 'accepted') {
    return 'status-passed'
  }
  if (status === 'wrong_answer') {
    return 'status-failed'
  }
  return 'status-warning'
}

function formatValue(value: unknown): string {
  if (value === undefined) {
    return '—'
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function ResultsPanel({
  result,
  running,
  error,
  mode,
  onExplain,
}: ResultsPanelProps): JSX.Element {
  if (running) {
    return (
      <div className="results-panel" aria-live="polite">
        <p className="results-placeholder">
          Running {mode === 'sample' ? 'samples' : 'hidden tests'}…
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="results-panel" aria-live="polite">
        <div className="callout callout-error">
          <strong>Run failed.</strong>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="results-panel" aria-live="polite">
        <p className="results-placeholder">
          Run the sample tests to see structured feedback. Submit runs the hidden tests.
        </p>
      </div>
    )
  }

  const failure = result.firstFailure
  const visibleTests = result.tests.slice(0, 16)

  return (
    <div className="results-panel" aria-live="polite">
      <div className="result-summary">
        <span className={`status-pill ${statusTone(result.status)}`}>
          {statusLabel(result.status)}
        </span>
        <span>
          {result.passed}/{result.total} tests
        </span>
        <span>{result.runtime.totalMs} ms total</span>
      </div>

      {result.message ? <p className="result-message">{result.message}</p> : null}

      {!result.compile.ok ? (
        <div className="callout callout-error">
          <strong>Compilation failed</strong>
          <pre>{result.compile.stderr || 'The compiler returned no output.'}</pre>
        </div>
      ) : null}

      {failure ? (
        <div className="failure-card">
          <div className="failure-heading">
            <h3>
              First failure · test {failure.index + 1}{' '}
              <span className="muted">({failure.isSample ? 'sample' : 'hidden'})</span>
            </h3>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onExplain}
              disabled={!onExplain}
            >
              Explain failure
            </button>
          </div>

          {failure.message ? <p>{failure.message}</p> : null}

          <div className="failure-values">
            <div>
              <h4>Input</h4>
              <pre>{formatValue(failure.input)}</pre>
            </div>
            <div>
              <h4>Expected</h4>
              <pre>{formatValue(failure.expected)}</pre>
            </div>
            <div>
              <h4>Actual</h4>
              <pre>{formatValue(failure.actual)}</pre>
            </div>
          </div>

          {failure.error ? (
            <div className="callout callout-error">
              <strong>
                {failure.error.type}: {failure.error.message}
              </strong>
              {failure.error.userLine > 0 ? <p>Line {failure.error.userLine}</p> : null}
              <pre>{failure.error.stack}</pre>
            </div>
          ) : null}

          {failure.userStderr ? (
            <div>
              <h4>stderr</h4>
              <pre>{failure.userStderr}</pre>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="test-strip" aria-label="Per-test results">
        {visibleTests.map((test) => (
          <span
            key={`${test.index}-${test.isSample ? 'sample' : 'hidden'}`}
            className={`test-chip ${statusTone(test.status)}`}
            title={`Test ${test.index + 1}: ${statusLabel(test.status)}`}
          >
            {test.index + 1}
          </span>
        ))}
        {result.tests.length > visibleTests.length ? (
          <span className="muted">+{result.tests.length - visibleTests.length} more</span>
        ) : null}
      </div>
    </div>
  )
}
