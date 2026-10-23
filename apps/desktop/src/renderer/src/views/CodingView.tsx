import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { JSX } from 'react'
import type {
  AiPreview,
  Language,
  ProblemDetail,
  ProblemSummary,
  RunResult,
} from '../../../shared/types'
import { CodeEditor } from '../components/CodeEditor'
import { Markdown } from '../components/Markdown'
import { ResultsPanel } from '../components/ResultsPanel'
import { matchesShortcut, shortcuts } from '../lib/shortcuts'
import { useSettings } from '../settings'

interface CodingViewProps {
  readonly problems: readonly ProblemSummary[]
  readonly selectedProblemId: string | null
  readonly onOpenProblem: (problemId: string) => void
  readonly onBack: () => void
  readonly onStatsChanged: () => void
}

function difficultyClass(difficulty: ProblemSummary['difficulty']): string {
  return `difficulty difficulty-${difficulty}`
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
  onOpenProblem,
  onBack,
  onStatsChanged,
}: CodingViewProps): JSX.Element {
  if (selectedProblemId) {
    return (
      <ProblemLoader
        problemId={selectedProblemId}
        onBack={onBack}
        onStatsChanged={onStatsChanged}
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

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return problems
    }
    return problems.filter((problem) => {
      const haystack = [problem.title, problem.slug, ...problem.patterns].join(' ').toLowerCase()
      return haystack.includes(normalized)
    })
  }, [problems, query])

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

  const visibleProblems = remoteResults ?? filtered
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

      {visibleProblems.length === 0 ? (
        <section className="empty-state">
          <h2>No matches</h2>
          <p>Try a different title, pattern, or phrase from the statement.</p>
        </section>
      ) : (
        <div className="problem-list">
          {visibleProblems.map((problem) => (
            <button
              key={problem.id}
              type="button"
              className="problem-row"
              onClick={() => onOpenProblem(problem.id)}
            >
              <span className="problem-main">
                <span className="problem-title">{problem.title}</span>
                <span className="problem-meta">
                  {problem.patterns.map((pattern) => (
                    <span className="tag" key={pattern}>
                      {pattern}
                    </span>
                  ))}
                  <span className="tag tag-pack">{problem.packName}</span>
                </span>
              </span>
              <span className={difficultyClass(problem.difficulty)}>{problem.difficulty}</span>
              <span className="problem-arrow" aria-hidden="true">
                →
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ProblemLoader({
  problemId,
  onBack,
  onStatsChanged,
}: {
  readonly problemId: string
  readonly onBack: () => void
  readonly onStatsChanged: () => void
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

  return <ProblemWorkspace problem={problem} onBack={onBack} onStatsChanged={onStatsChanged} />
}

function ProblemWorkspace({
  problem,
  onBack,
  onStatsChanged,
}: {
  readonly problem: ProblemDetail
  readonly onBack: () => void
  readonly onStatsChanged: () => void
}): JSX.Element {
  const { settings } = useSettings()
  const [language, setLanguage] = useState<Language>(settings.language)
  const [code, setCode] = useState('')
  const [draftReady, setDraftReady] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'sample' | 'submit'>('sample')
  const [revealedHints, setRevealedHints] = useState<ReadonlySet<number>>(new Set())
  const [confirmHint, setConfirmHint] = useState<number | null>(null)
  const [aiPreview, setAiPreview] = useState<AiPreview | null>(null)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
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
          setCode(draft ?? problem.languageTemplates[language])
          setDraftReady(true)
        }
      })
      .catch((draftError: unknown) => {
        if (!cancelled) {
          setError(draftError instanceof Error ? draftError.message : String(draftError))
          setCode(problem.languageTemplates[language])
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
      void window.baseCase.drafts.save({ problemId: problem.id, language, code })
    }, 900)

    return () => {
      window.clearTimeout(timer)
    }
  }, [code, draftReady, language, problem.id])

  useEffect(() => {
    return () => {
      unsubscribeRef.current?.()
    }
  }, [])

  const run = useCallback(
    async (nextMode: 'sample' | 'submit') => {
      if (running) {
        return
      }

      setMode(nextMode)
      setRunning(true)
      setError(null)
      setAiPreview(null)
      setAiText('')
      setAiError(null)

      try {
        const nextResult = await window.baseCase.judge.run({
          problemId: problem.id,
          language,
          code,
          mode: nextMode,
        })
        setResult(nextResult)
        onStatsChanged()
      } catch (runError: unknown) {
        console.error('Judge run failed:', runError)
        setError(describeJudgeError(runError))
      } finally {
        setRunning(false)
      }
    },
    [code, language, onStatsChanged, problem.id, running],
  )

  useEffect(() => {
    const handler = (event: KeyboardEvent): void => {
      if (matchesShortcut(event, shortcuts.runSamples)) {
        event.preventDefault()
        void run('sample')
        return
      }

      if (matchesShortcut(event, shortcuts.submit)) {
        event.preventDefault()
        void run('submit')
      }
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [run])

  const changeLanguage = (nextLanguage: Language): void => {
    if (nextLanguage === language) {
      return
    }

    if (draftReady) {
      void window.baseCase.drafts.save({ problemId: problem.id, language, code })
    }

    setLanguage(nextLanguage)
  }

  const revealHint = (level: number): void => {
    if (level >= 4 && !revealedHints.has(level)) {
      setConfirmHint(level)
      return
    }

    setRevealedHints((current) => new Set(current).add(level))
  }

  const openAiPreview = async (): Promise<void> => {
    const failure = result?.firstFailure
    if (!failure) {
      return
    }

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
        <button type="button" className="text-button" onClick={onBack}>
          ← Back to problems
        </button>
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

      <div className="coding-grid">
        <section className="pane statement-pane">
          <div className="pane-header">
            <span>Problem</span>
            <span className="muted">Cmd/Ctrl+Enter to run</span>
          </div>
          <div className="pane-scroll">
            <Markdown>{problem.statement}</Markdown>

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
            </div>
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
              onExplain={result?.firstFailure ? () => void openAiPreview() : undefined}
            />
          </div>
        </section>
      </div>

      {aiLoading || aiText || aiError ? (
        <section className="pane ai-panel">
          <div className="pane-header">
            <span>AI tutor</span>
            <span className="muted">Optional · context-limited · no full solution</span>
          </div>
          <div className="ai-body">
            {aiError ? (
              <div className="callout callout-error">
                <strong>AI request failed.</strong>
                <p>{aiError}</p>
              </div>
            ) : null}
            {aiText ? <div className="ai-response">{aiText}</div> : null}
            {aiLoading && !aiText ? <p className="muted">Waiting for the provider…</p> : null}
          </div>
        </section>
      ) : null}

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
