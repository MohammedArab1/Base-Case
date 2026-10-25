import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, JSX } from 'react'
import type {
  AiPreview,
  AttemptMode,
  Language,
  ProblemDetail,
  ProblemProgressEntry,
  ProblemSummary,
  ReviewGrade,
  ReviewPreview,
  RunResult,
} from '../../../shared/types'
import { Inspector } from '../components/Inspector'
import { CodeEditor } from '../components/CodeEditor'
import { Markdown } from '../components/Markdown'
import { ResultsPanel } from '../components/ResultsPanel'
import { matchesShortcut, shortcuts } from '../lib/shortcuts'
import { useSettings } from '../settings'
import { Button } from '../ui/Button'

const inspectorWidthKey = 'base-case.inspector.width'
const inspectorOpenKey = 'base-case.inspector.open'
const defaultInspectorWidth = 320
const minInspectorWidth = 240
const maxInspectorWidth = 520

function clampInspectorWidth(value: number): number {
  return Math.min(maxInspectorWidth, Math.max(minInspectorWidth, Math.round(value)))
}

function initialInspectorWidth(): number {
  try {
    const stored = Number(window.localStorage.getItem(inspectorWidthKey))
    return Number.isFinite(stored) && stored > 0
      ? clampInspectorWidth(stored)
      : defaultInspectorWidth
  } catch {
    return defaultInspectorWidth
  }
}

function initialInspectorOpen(): boolean {
  try {
    return window.localStorage.getItem(inspectorOpenKey) !== 'false'
  } catch {
    return true
  }
}

function persistInspectorWidth(width: number): void {
  try {
    window.localStorage.setItem(inspectorWidthKey, String(width))
  } catch {
    // A disabled localStorage must not break resizing.
  }
}

function persistInspectorOpen(open: boolean): void {
  try {
    window.localStorage.setItem(inspectorOpenKey, String(open))
  } catch {
    // A disabled localStorage must not break the toggle.
  }
}

interface CodingViewProps {
  readonly problems: readonly ProblemSummary[]
  readonly selectedProblemId: string | null
  readonly reviewCardId?: string | null
  readonly onOpenProblem: (problemId: string) => void
  readonly onBack: () => void
  readonly onReviewFinished?: () => void
}

function difficultyClass(difficulty: ProblemSummary['difficulty']): string {
  return `difficulty difficulty-${difficulty}`
}

const gradeLabels: Record<ReviewGrade, string> = {
  again: 'Again',
  hard: 'Hard',
  good: 'Good',
  easy: 'Easy',
}

function formatReviewInterval(preview: ReviewPreview): string {
  const minutes = Math.max(1, Math.round((new Date(preview.dueAt).getTime() - Date.now()) / 60_000))

  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.round(minutes / 60)
  return hours < 24 ? `${hours}h` : `${Math.round(hours / 24)}d`
}

function describeJudgeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  const unwrapped = message.replace(/^Error invoking remote method '[^']+': Error: /, '')

  if (/Judge sidecar exited/i.test(unwrapped)) {
    return 'The judge stopped unexpectedly. Run again to restart it.'
  }

  if (/Judge request timed out/i.test(unwrapped)) {
    return 'The judge did not respond in time. Try again, or restart the app if it repeats.'
  }

  if (/Judge sidecar (failed to start|is not running)/i.test(unwrapped)) {
    return 'The judge could not start. Check that Python and Node are installed, then restart the app.'
  }

  return unwrapped
}

export function CodingView({
  problems,
  selectedProblemId,
  reviewCardId,
  onOpenProblem,
  onBack,
  onReviewFinished,
}: CodingViewProps): JSX.Element {
  if (selectedProblemId) {
    return (
      <ProblemLoader
        problemId={selectedProblemId}
        reviewCardId={reviewCardId}
        onBack={onBack}
        onReviewFinished={onReviewFinished}
      />
    )
  }

  return <ProblemList problems={problems} onOpenProblem={onOpenProblem} />
}

function ProblemList({
  problems,
  onOpenProblem,
}: {
  readonly problems: readonly ProblemSummary[]
  readonly onOpenProblem: (problemId: string) => void
}): JSX.Element {
  const [query, setQuery] = useState('')
  const [remoteResults, setRemoteResults] = useState<readonly ProblemSummary[] | null>(null)
  const [difficulty, setDifficulty] = useState<'all' | ProblemSummary['difficulty']>('all')
  const [pattern, setPattern] = useState('all')
  const [status, setStatus] = useState<'all' | 'attempted' | 'accepted' | 'not-started'>('all')
  const [dueOnly, setDueOnly] = useState(false)
  const [progress, setProgress] = useState<readonly ProblemProgressEntry[]>([])

  useEffect(() => {
    let cancelled = false

    void window.baseCase.progress
      .problems()
      .then((entries) => {
        if (!cancelled) {
          setProgress(entries)
        }
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [])

  const progressByProblem = useMemo(
    () => new Map(progress.map((entry) => [entry.problemId, entry])),
    [progress],
  )

  const patterns = useMemo(
    () => [...new Set(problems.flatMap((problem) => problem.patterns))].sort(),
    [problems],
  )

  const visibleProblems = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const base = remoteResults ?? problems

    return base.filter((problem) => {
      if (difficulty !== 'all' && problem.difficulty !== difficulty) {
        return false
      }

      if (pattern !== 'all' && !problem.patterns.includes(pattern)) {
        return false
      }

      const entry = progressByProblem.get(problem.id)

      if (status === 'attempted' && !entry?.attempts) {
        return false
      }

      if (status === 'accepted' && !entry?.accepted) {
        return false
      }

      if (status === 'not-started' && entry?.attempts) {
        return false
      }

      if (dueOnly) {
        const due = entry?.reviewDueAt ? new Date(entry.reviewDueAt).getTime() : Infinity

        if (due > Date.now()) {
          return false
        }
      }

      if (!remoteResults && normalized) {
        const haystack = [problem.title, problem.slug, ...problem.patterns].join(' ').toLowerCase()

        return haystack.includes(normalized)
      }

      return true
    })
  }, [difficulty, dueOnly, pattern, problems, progressByProblem, query, remoteResults, status])

  useEffect(() => {
    const normalized = query.trim()

    if (!normalized) {
      setRemoteResults(null)
      return
    }

    let cancelled = false
    setRemoteResults(null)

    const timer = window.setTimeout(() => {
      void window.baseCase.content
        .search(normalized)
        .then((results) => {
          if (!cancelled) {
            setRemoteResults(results)
          }
        })
        .catch(() => {
          if (!cancelled) {
            setRemoteResults(null)
          }
        })
    }, 150)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [problems, query])

  const packCount = new Set(problems.map((problem) => problem.packId)).size

  return (
    <div className="workspace-stack">
      <div className="list-toolbar">
        <div>
          <h2>Problem library</h2>
          <p className="muted">
            {problems.length} {problems.length === 1 ? 'problem' : 'problems'} · {packCount}{' '}
            {packCount === 1 ? 'pack' : 'packs'} · original content
          </p>
        </div>
        <input
          className="input search-input"
          type="search"
          placeholder="Search title, pattern, or statement"
          aria-label="Search problems"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="list-filters">
        <label className="filter-field">
          <span>Difficulty</span>
          <select
            className="input"
            aria-label="Difficulty filter"
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value as 'all' | ProblemSummary['difficulty'])
            }
          >
            <option value="all">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        <label className="filter-field">
          <span>Pattern</span>
          <select
            className="input"
            aria-label="Pattern filter"
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
          >
            <option value="all">All</option>
            {patterns.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Status</span>
          <select
            className="input"
            aria-label="Status filter"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as 'all' | 'attempted' | 'accepted' | 'not-started')
            }
          >
            <option value="all">All</option>
            <option value="not-started">Not started</option>
            <option value="attempted">Attempted</option>
            <option value="accepted">Accepted</option>
          </select>
        </label>

        <label className="checkbox filter-check">
          <input
            type="checkbox"
            checked={dueOnly}
            onChange={(event) => setDueOnly(event.target.checked)}
          />
          Review due
        </label>
      </div>

      {visibleProblems.length === 0 ? (
        <section className="empty-state">
          <h2>No matches</h2>
          <p>Try a different title, pattern, or phrase from the statement.</p>
        </section>
      ) : (
        <div className="problem-list">
          {visibleProblems.map((problem) => {
            const entry = progressByProblem.get(problem.id)
            const due = entry?.reviewDueAt
              ? new Date(entry.reviewDueAt).getTime() <= Date.now()
              : false

            return (
              <button
                key={problem.id}
                type="button"
                className="problem-row"
                onClick={() => onOpenProblem(problem.id)}
              >
                <span className="problem-main">
                  <span className="problem-title">{problem.title}</span>
                  <span className="problem-meta">
                    {problem.patterns.map((value) => (
                      <span className="tag" key={value}>
                        {value}
                      </span>
                    ))}
                    <span className="tag tag-pack">{problem.packName}</span>
                    {entry?.accepted ? <span className="tag tag-accepted">Accepted</span> : null}
                    {due ? <span className="tag tag-due">Review due</span> : null}
                  </span>
                </span>
                <span className={difficultyClass(problem.difficulty)}>{problem.difficulty}</span>
                <span className="problem-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ProblemLoader({
  problemId,
  reviewCardId,
  onBack,
  onReviewFinished,
}: {
  readonly problemId: string
  readonly reviewCardId?: string | null
  readonly onBack: () => void
  readonly onReviewFinished?: () => void
}): JSX.Element {
  const [problem, setProblem] = useState<ProblemDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void window.baseCase.content
      .get(problemId)
      .then((nextProblem) => {
        if (!cancelled) {
          setProblem(nextProblem)
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
  }, [problemId])

  if (error) {
    return (
      <div className="workspace-stack">
        <button type="button" className="text-button" onClick={onBack}>
          ← Back to problems
        </button>
        <div className="callout callout-error">
          <strong>Could not load the problem.</strong>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="workspace-stack">
        <p className="muted">Loading problem…</p>
      </div>
    )
  }

  return (
    <ProblemWorkspace
      problem={problem}
      reviewCardId={reviewCardId}
      onBack={onBack}
      onReviewFinished={onReviewFinished}
    />
  )
}

function ProblemWorkspace({
  problem,
  reviewCardId,
  onBack,
  onReviewFinished,
}: {
  readonly problem: ProblemDetail
  readonly reviewCardId?: string | null
  readonly onBack: () => void
  readonly onReviewFinished?: () => void
}): JSX.Element {
  const { settings } = useSettings()
  const isReview = Boolean(reviewCardId)
  const [language, setLanguage] = useState<Language>(settings.language)
  const [code, setCode] = useState('')
  const [plan, setPlan] = useState('')
  const [draftReady, setDraftReady] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<AttemptMode>(isReview ? 'review' : 'sample')
  const [revealedHints, setRevealedHints] = useState<ReadonlySet<number>>(new Set())
  const [solutionViewed, setSolutionViewed] = useState(false)
  const [confirmHint, setConfirmHint] = useState<number | null>(null)
  const [reviewPreviews, setReviewPreviews] = useState<readonly ReviewPreview[]>([])
  const [grading, setGrading] = useState<ReviewGrade | null>(null)
  const [gradeError, setGradeError] = useState<string | null>(null)
  const [runProgress, setRunProgress] = useState<{
    readonly completed: number
    readonly total: number
  } | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const activeRequestRef = useRef<string | null>(null)
  const [aiPreview, setAiPreview] = useState<AiPreview | null>(null)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [inspectorOpen, setInspectorOpen] = useState(initialInspectorOpen)
  const [inspectorWidth, setInspectorWidth] = useState(initialInspectorWidth)
  const [attemptRefreshKey, setAttemptRefreshKey] = useState(0)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    let cancelled = false

    setDraftReady(false)
    setResult(null)
    setError(null)
    setAiPreview(null)
    setAiText('')
    setAiError(null)

    void window.baseCase.drafts
      .get({ problemId: problem.id, language })
      .then((draft) => {
        if (!cancelled) {
          setCode(draft?.code ?? problem.languageTemplates[language])
          setPlan(draft?.plan ?? '')
          setDraftReady(true)
        }
      })
      .catch((draftError: unknown) => {
        if (!cancelled) {
          setError(draftError instanceof Error ? draftError.message : String(draftError))
          setCode(problem.languageTemplates[language])
          setPlan('')
          setDraftReady(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [language, problem.id, problem.languageTemplates])

  useEffect(() => {
    if (!draftReady) {
      return
    }

    const timer = window.setTimeout(() => {
      void window.baseCase.drafts.save({ problemId: problem.id, language, code, plan })
    }, 900)

    return () => {
      window.clearTimeout(timer)
    }
  }, [code, draftReady, language, plan, problem.id])

  useEffect(() => {
    return () => {
      unsubscribeRef.current?.()
    }
  }, [])

  useEffect(() => {
    return window.baseCase.judge.onEvent((event) => {
      if (event.requestId !== activeRequestRef.current || event.type !== 'test') {
        return
      }

      setRunProgress((current) => ({
        completed: (current?.completed ?? 0) + 1,
        total: event.isSample ? problem.testCounts.sample : problem.testCounts.hidden,
      }))
    })
  }, [problem.testCounts.hidden, problem.testCounts.sample])

  const run = useCallback(
    async (nextMode: AttemptMode) => {
      if (running) {
        return
      }

      const requestId = crypto.randomUUID()
      activeRequestRef.current = requestId
      setMode(nextMode)
      setRunning(true)
      setRunProgress(null)
      setError(null)
      setGradeError(null)
      setAiPreview(null)
      setAiText('')
      setAiError(null)

      try {
        const nextResult = await window.baseCase.judge.run({
          problemId: problem.id,
          language,
          code,
          mode: nextMode,
          plan,
          hintsUsed: revealedHints.size,
          solutionViewed,
          requestId,
        })
        setResult(nextResult)
        setAttemptRefreshKey((current) => current + 1)
      } catch (runError: unknown) {
        console.error('Judge run failed:', runError)
        setError(describeJudgeError(runError))
      } finally {
        activeRequestRef.current = null
        setRunning(false)
        setRunProgress(null)
        setCancelling(false)
      }
    },
    [code, language, plan, problem.id, revealedHints.size, running, solutionViewed],
  )

  const cancelRun = async (): Promise<void> => {
    const requestId = activeRequestRef.current

    if (!requestId) {
      return
    }

    setCancelling(true)

    try {
      await window.baseCase.judge.cancel(requestId)
    } catch {
      // The run promise reports the final state; a failed cancel is harmless.
      setCancelling(false)
    }
  }

  useEffect(() => {
    const handler = (event: KeyboardEvent): void => {
      if (matchesShortcut(event, shortcuts.runSamples)) {
        event.preventDefault()
        void run(isReview ? 'review' : 'sample')
        return
      }

      if (matchesShortcut(event, shortcuts.submit)) {
        event.preventDefault()
        void run(isReview ? 'review' : 'submit')
      }
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [isReview, run])

  const changeLanguage = (nextLanguage: Language): void => {
    if (nextLanguage === language) {
      return
    }

    if (draftReady) {
      void window.baseCase.drafts.save({ problemId: problem.id, language, code, plan })
    }

    setLanguage(nextLanguage)
  }

  const revealHint = (level: number): void => {
    if (level >= 4 && !revealedHints.has(level)) {
      setConfirmHint(level)
      return
    }

    setRevealedHints((current) => new Set(current).add(level))

    if (level >= 4) {
      setSolutionViewed(true)
    }
  }

  const gradeReview = async (grade: ReviewGrade): Promise<void> => {
    if (!reviewCardId || grading) {
      return
    }

    setGrading(grade)
    setGradeError(null)

    try {
      await window.baseCase.review.grade({ cardId: reviewCardId, grade })
      onReviewFinished?.()
    } catch (gradeFailure: unknown) {
      setGradeError(gradeFailure instanceof Error ? gradeFailure.message : String(gradeFailure))
    } finally {
      setGrading(null)
    }
  }

  useEffect(() => {
    if (!reviewCardId) {
      setReviewPreviews([])
      return
    }

    let cancelled = false

    void window.baseCase.review
      .preview(reviewCardId)
      .then((previews) => {
        if (!cancelled) {
          setReviewPreviews(previews)
        }
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [reviewCardId])

  const setInspectorVisible = (open: boolean): void => {
    setInspectorOpen(open)
    persistInspectorOpen(open)
  }

  const startInspectorResize = (event: React.PointerEvent<HTMLDivElement>): void => {
    event.preventDefault()
    const startX = event.clientX
    const startWidth = inspectorWidth
    let latestWidth = startWidth

    const move = (moveEvent: PointerEvent): void => {
      latestWidth = clampInspectorWidth(startWidth + startX - moveEvent.clientX)
      setInspectorWidth(latestWidth)
    }

    const stop = (): void => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
      persistInspectorWidth(latestWidth)
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  const resizeInspectorBy = (delta: number): void => {
    const next = clampInspectorWidth(inspectorWidth + delta)
    setInspectorWidth(next)
    persistInspectorWidth(next)
  }

  const handleInspectorResizeKey = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      resizeInspectorBy(16)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      resizeInspectorBy(-16)
    }
  }

  const openAiPreview = async (): Promise<void> => {
    const failure = result?.firstFailure
    if (!failure) {
      return
    }

    setInspectorVisible(true)
    setAiError(null)

    try {
      const preview = await window.baseCase.ai.preview({
        problemId: problem.id,
        language,
        code,
        failure,
      })
      setAiPreview(preview)
    } catch (previewError: unknown) {
      setAiError(previewError instanceof Error ? previewError.message : String(previewError))
    }
  }

  const sendAi = async (): Promise<void> => {
    const failure = result?.firstFailure
    if (!failure) {
      return
    }

    setAiPreview(null)
    setAiText('')
    setAiError(null)
    setAiLoading(true)
    setInspectorVisible(true)

    const unsubscribe = window.baseCase.ai.onEvent((event) => {
      if (event.type === 'chunk') {
        setAiText((current) => current + event.text)
        return
      }

      if (event.type === 'done') {
        setAiLoading(false)
        unsubscribeRef.current = null
        unsubscribe()
        return
      }

      setAiError(event.message)
      setAiLoading(false)
      unsubscribeRef.current = null
      unsubscribe()
    })

    unsubscribeRef.current = unsubscribe

    try {
      await window.baseCase.ai.explain({
        problemId: problem.id,
        language,
        code,
        failure,
      })
    } catch (explainError: unknown) {
      setAiError(explainError instanceof Error ? explainError.message : String(explainError))
      setAiLoading(false)
      unsubscribe()
      unsubscribeRef.current = null
    }
  }

  return (
    <div className="workspace-stack">
      <div className="workspace-heading">
        <div className="workspace-heading-top">
          <button type="button" className="text-button" onClick={onBack}>
            {isReview ? '← Back to review queue' : '← Back to problems'}
          </button>
          <Button
            size="sm"
            variant="secondary"
            aria-expanded={inspectorOpen}
            aria-controls="problem-inspector"
            onClick={() => setInspectorVisible(!inspectorOpen)}
            data-testid="toggle-inspector"
          >
            Inspector
          </Button>
        </div>
        <div>
          <h2>{problem.title}</h2>
          <p className="muted">
            <span className={difficultyClass(problem.difficulty)}>{problem.difficulty}</span>
            {' · '}
            {problem.patterns.join(', ')}
            {' · '}
            {problem.testCounts.sample} samples, {problem.testCounts.hidden} hidden
          </p>
        </div>
      </div>

      {isReview ? (
        <div className="callout review-banner" data-testid="review-banner">
          <strong>Review mode</strong>
          <p>Hints and solutions are hidden. Re-solve the problem, then grade the review.</p>
        </div>
      ) : null}

      <div
        className="coding-layout"
        style={{ '--inspector-width': `${inspectorWidth}px` } as CSSProperties}
      >
        <div className="coding-grid">
          <section className="pane statement-pane">
            <div className="pane-header">
              <span>Problem</span>
              <span className="muted">Cmd/Ctrl+Enter to run</span>
            </div>
            <div className="pane-scroll">
              <Markdown>{problem.statement}</Markdown>

              {isReview ? (
                <p className="muted review-hidden-note">
                  Hints, common mistakes, and follow-ups are hidden during review.
                </p>
              ) : (
                <>
                  <section className="hints">
                    <h3>Hints</h3>
                    {problem.hints.map((hint) => {
                      const revealed = revealedHints.has(hint.level)

                      return (
                        <div className="hint" key={hint.level}>
                          <button
                            type="button"
                            className="hint-toggle"
                            aria-expanded={revealed}
                            onClick={() => revealHint(hint.level)}
                          >
                            <span className="hint-level">Level {hint.level}</span>
                            <span>{hint.title}</span>
                          </button>
                          {confirmHint === hint.level ? (
                            <div className="hint-confirm">
                              <p>Level 4 may reveal pseudocode. Continue?</p>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                  setRevealedHints((current) => new Set(current).add(hint.level))
                                  setSolutionViewed(true)
                                  setConfirmHint(null)
                                }}
                              >
                                Show pseudocode
                              </button>
                            </div>
                          ) : null}
                          {revealed ? (
                            <div className="hint-body">
                              <Markdown>{hint.body}</Markdown>
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </section>

                  {problem.commonMistakes.length > 0 ? (
                    <details className="statement-details">
                      <summary>Common mistakes</summary>
                      <ul>
                        {problem.commonMistakes.map((mistake) => (
                          <li key={mistake}>{mistake}</li>
                        ))}
                      </ul>
                    </details>
                  ) : null}

                  {problem.followUps.length > 0 ? (
                    <details className="statement-details">
                      <summary>Follow-ups</summary>
                      <ul>
                        {problem.followUps.map((followUp) => (
                          <li key={followUp}>{followUp}</li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </>
              )}
            </div>
          </section>

          <section className="pane editor-pane">
            <div className="pane-header editor-toolbar">
              <div className="segmented" role="group" aria-label="Language">
                <button
                  type="button"
                  aria-pressed={language === 'python'}
                  onClick={() => changeLanguage('python')}
                >
                  Python
                </button>
                <button
                  type="button"
                  aria-pressed={language === 'typescript'}
                  onClick={() => changeLanguage('typescript')}
                >
                  TypeScript
                </button>
              </div>
              <div className="toolbar-actions">
                {running ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => void cancelRun()}
                    disabled={cancelling}
                    data-testid="cancel-run"
                  >
                    {cancelling ? 'Cancelling…' : 'Cancel'}
                  </button>
                ) : null}
                {isReview ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => void run('review')}
                    disabled={running}
                  >
                    Check review
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => void run('sample')}
                      disabled={running}
                    >
                      Run samples
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => void run('submit')}
                      disabled={running}
                    >
                      Submit
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="plan-field">
              <label htmlFor="problem-plan">Plan before you code</label>
              <textarea
                id="problem-plan"
                data-testid="problem-plan"
                className="plan-input"
                value={plan}
                onChange={(event) => setPlan(event.target.value)}
                placeholder="Approach, data structures, edge cases, complexity…"
                rows={2}
              />
            </div>
            <div className="editor-body">
              <CodeEditor
                key={`${problem.id}-${language}`}
                value={code}
                language={language}
                onChange={setCode}
                ariaLabel={`${problem.title} ${language} code editor`}
              />
            </div>
            <div className="results-scroll">
              <ResultsPanel
                result={result}
                running={running}
                error={error}
                mode={mode}
                progress={runProgress}
                onExplain={result?.firstFailure ? () => void openAiPreview() : undefined}
              />
            </div>

            {isReview && result ? (
              <div className="review-grade-panel" data-testid="review-grade-panel">
                <div>
                  <strong>Grade this review</strong>
                  <p className="muted">
                    The attempt is saved. Choose how well you recalled the approach.
                  </p>
                </div>
                <div className="review-grades">
                  {(['again', 'hard', 'good', 'easy'] as const).map((grade) => {
                    const preview = reviewPreviews.find((item) => item.grade === grade)

                    return (
                      <button
                        key={grade}
                        type="button"
                        className={`btn btn-secondary review-grade grade-${grade}`}
                        onClick={() => void gradeReview(grade)}
                        disabled={grading !== null}
                        data-testid={`grade-${grade}`}
                      >
                        <span>{gradeLabels[grade]}</span>
                        {preview ? (
                          <span className="review-grade-interval">
                            {formatReviewInterval(preview)}
                          </span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
                {gradeError ? <p className="form-error">{gradeError}</p> : null}
              </div>
            ) : null}
          </section>
        </div>

        {inspectorOpen ? (
          <>
            <div
              className="inspector-resizer"
              role="separator"
              aria-label="Resize inspector"
              aria-orientation="vertical"
              aria-valuemin={minInspectorWidth}
              aria-valuemax={maxInspectorWidth}
              aria-valuenow={inspectorWidth}
              tabIndex={0}
              onPointerDown={startInspectorResize}
              onKeyDown={handleInspectorResizeKey}
            />
            <Inspector
              problemId={problem.id}
              problemTitle={problem.title}
              attemptRefreshKey={attemptRefreshKey}
              ai={{
                hasFailure: Boolean(result?.firstFailure),
                text: aiText,
                loading: aiLoading,
                error: aiError,
                onExplain: () => void openAiPreview(),
              }}
              onRestore={(restoredCode, restoredPlan) => {
                setCode(restoredCode)
                setPlan(restoredPlan)
              }}
              onClose={() => setInspectorVisible(false)}
            />
          </>
        ) : null}
      </div>

      {aiPreview ? (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="ai-preview-title">
            <h2 id="ai-preview-title">AI context preview</h2>
            <p className="muted">
              This is exactly what would be sent to the configured provider. Hidden tests beyond the
              first failure are not included.
            </p>
            <pre className="ai-preview">{aiPreview.text}</pre>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setAiPreview(null)}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={() => void sendAi()}>
                Send to provider
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
