import { useCallback, useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import type { AttemptSummary, Failure, Language, MistakeTag } from '../../../shared/types'
import { AiPanel } from './AiPanel'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs'

interface InspectorProps {
  readonly problemId: string
  readonly problemTitle: string
  readonly attemptRefreshKey: number
  readonly language: Language
  readonly code: string
  readonly plan: string
  readonly failure?: Failure
  readonly priorHints?: readonly string[]
  readonly aiTrigger: number
  readonly aiDisabledReason?: string
  readonly onRestore: (code: string, plan: string) => void
  readonly onClose: () => void
}

export function Inspector({
  problemId,
  problemTitle,
  attemptRefreshKey,
  language,
  code,
  plan,
  failure,
  priorHints,
  aiTrigger,
  aiDisabledReason,
  onRestore,
  onClose,
}: InspectorProps): JSX.Element {
  return (
    <aside
      id="problem-inspector"
      className="pane inspector-pane"
      aria-label="Inspector"
      data-testid="inspector"
    >
      <div className="pane-header">
        <span>Inspector</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          aria-label="Close inspector"
          data-testid="close-inspector"
        >
          ×
        </Button>
      </div>

      <Tabs defaultValue="ai" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-3 mt-3 justify-start self-start">
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <div className="inspector-scroll">
          <TabsContent value="ai" className="pt-0">
            <AiTab
              problemId={problemId}
              language={language}
              code={code}
              plan={plan}
              failure={failure}
              priorHints={priorHints}
              trigger={aiTrigger}
              disabledReason={aiDisabledReason}
            />
          </TabsContent>
          <TabsContent value="notes" className="pt-0">
            <NotesTab problemId={problemId} problemTitle={problemTitle} />
          </TabsContent>
          <TabsContent value="history" className="pt-0">
            <HistoryTab
              problemId={problemId}
              refreshKey={attemptRefreshKey}
              onRestore={onRestore}
            />
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  )
}

function AiTab({
  problemId,
  language,
  code,
  plan,
  failure,
  priorHints,
  trigger,
  disabledReason,
}: {
  readonly problemId: string
  readonly language: Language
  readonly code: string
  readonly plan: string
  readonly failure?: Failure
  readonly priorHints?: readonly string[]
  readonly trigger: number
  readonly disabledReason?: string
}): JSX.Element {
  return (
    <AiPanel
      variant="coding"
      context={{ problemId, language, code, failure }}
      hasFailure={Boolean(failure)}
      hasPlan={plan.trim().length > 0}
      priorHints={priorHints}
      trigger={trigger}
      disabledReason={disabledReason}
    />
  )
}

function NotesTab({
  problemId,
  problemTitle,
}: {
  readonly problemId: string
  readonly problemTitle: string
}): JSX.Element {
  const [note, setNote] = useState('')
  const [savedNote, setSavedNote] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [status, setStatus] = useState<'loading' | 'idle' | 'saving' | 'saved' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const noteRef = useRef('')
  const savedRef = useRef('')

  useEffect(() => {
    noteRef.current = note
  }, [note])

  useEffect(() => {
    let cancelled = false

    setLoaded(false)
    setStatus('loading')
    setError(null)

    void window.baseCase.notes
      .get(problemId)
      .then((result) => {
        if (cancelled) {
          return
        }

        setNote(result.notes)
        setSavedNote(result.notes)
        noteRef.current = result.notes
        savedRef.current = result.notes
        setLoaded(true)
        setStatus('idle')
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : String(loadError))
          setLoaded(true)
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [problemId])

  const persist = useCallback(
    async (text: string): Promise<void> => {
      if (text === savedRef.current) {
        setStatus('saved')
        return
      }

      setStatus('saving')
      setError(null)

      try {
        const saved = await window.baseCase.notes.save({ problemId, notes: text })
        savedRef.current = saved.notes
        setSavedNote(saved.notes)
        setStatus('saved')
      } catch (saveError: unknown) {
        setError(saveError instanceof Error ? saveError.message : String(saveError))
        setStatus('error')
      }
    },
    [problemId],
  )

  useEffect(() => {
    if (!loaded || note === savedNote) {
      return
    }

    setStatus('saving')
    const timer = window.setTimeout(() => {
      void persist(note)
    }, 700)

    return () => {
      window.clearTimeout(timer)
    }
  }, [loaded, note, persist, savedNote])

  // Flush the latest value when the tab or workspace unmounts.
  useEffect(() => {
    return () => {
      if (noteRef.current !== savedRef.current) {
        void window.baseCase.notes
          .save({ problemId, notes: noteRef.current })
          .catch(() => undefined)
      }
    }
  }, [problemId])

  return (
    <div className="p-3">
      <label className="m-0 text-xs font-semibold text-bc-muted" htmlFor="problem-notes">
        Notes for {problemTitle}
      </label>
      <textarea
        id="problem-notes"
        data-testid="problem-notes"
        className="mt-2 min-h-56 w-full resize-y rounded-lg border border-bc-border bg-bc-surface p-3 font-[inherit] text-sm leading-relaxed text-bc-text placeholder:text-bc-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bc-accent"
        placeholder="What did you try? What did you learn?"
        value={note}
        disabled={!loaded}
        onChange={(event) => setNote(event.target.value)}
        onBlur={() => void persist(note)}
      />
      <p
        className="m-0 mt-2 text-[11px] text-bc-muted"
        data-testid="notes-status"
        role="status"
        aria-live="polite"
      >
        {status === 'loading'
          ? 'Loading notes…'
          : status === 'saving'
            ? 'Saving…'
            : status === 'saved'
              ? 'Saved locally'
              : status === 'error'
                ? (error ?? 'Could not save notes')
                : 'Autosaves locally'}
      </p>
    </div>
  )
}

function HistoryTab({
  problemId,
  refreshKey,
  onRestore,
}: {
  readonly problemId: string
  readonly refreshKey: number
  readonly onRestore: (code: string, plan: string) => void
}): JSX.Element {
  const [attempts, setAttempts] = useState<readonly AttemptSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tags, setTags] = useState<readonly MistakeTag[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [selected, setSelected] = useState<readonly string[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    setAttempts(null)
    setError(null)

    void window.baseCase.attempts
      .list(problemId)
      .then((nextAttempts) => {
        if (!cancelled) {
          setAttempts(nextAttempts)
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
  }, [problemId, refreshKey])

  useEffect(() => {
    let cancelled = false

    void window.baseCase.mistakes
      .list()
      .then((nextTags) => {
        if (!cancelled) {
          setTags(nextTags)
        }
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [])

  const toggleTag = (tagId: string): void => {
    setSelected((current) =>
      current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId],
    )
  }

  const openTags = async (attemptId: string): Promise<void> => {
    if (editing === attemptId) {
      setEditing(null)
      return
    }

    setBusy(attemptId)
    setActionError(null)

    try {
      const detail = await window.baseCase.attempts.get(attemptId)
      setSelected(detail.mistakeTagIds)
      setEditing(attemptId)
    } catch (loadError: unknown) {
      setActionError(loadError instanceof Error ? loadError.message : String(loadError))
    } finally {
      setBusy(null)
    }
  }

  const saveTags = async (attemptId: string): Promise<void> => {
    setBusy(attemptId)
    setActionError(null)

    try {
      await window.baseCase.attempts.tag({ attemptId, tagIds: selected })
      setEditing(null)
    } catch (saveError: unknown) {
      setActionError(saveError instanceof Error ? saveError.message : String(saveError))
    } finally {
      setBusy(null)
    }
  }

  const restore = async (attemptId: string): Promise<void> => {
    setBusy(attemptId)
    setActionError(null)

    try {
      const detail = await window.baseCase.attempts.get(attemptId)
      onRestore(detail.code, detail.plan)
    } catch (restoreError: unknown) {
      setActionError(restoreError instanceof Error ? restoreError.message : String(restoreError))
    } finally {
      setBusy(null)
    }
  }

  if (error) {
    return (
      <div className="p-3">
        <div className="rounded-lg border border-bc-danger bg-bc-danger-soft p-2.5 text-xs text-bc-danger">
          {error}
        </div>
      </div>
    )
  }

  if (attempts === null) {
    return <p className="m-0 p-3 text-xs text-bc-muted">Loading attempts…</p>
  }

  if (attempts.length === 0) {
    return (
      <p className="m-0 p-3 text-xs leading-relaxed text-bc-muted">
        No attempts yet. Run samples to start a local history for this problem.
      </p>
    )
  }

  return (
    <div className="p-3">
      {actionError ? (
        <div className="mb-2 rounded-lg border border-bc-danger bg-bc-danger-soft p-2.5 text-xs text-bc-danger">
          {actionError}
        </div>
      ) : null}

      <ul className="m-0 flex list-none flex-col gap-2 p-0" data-testid="attempt-history">
        {attempts.map((attempt) => (
          <li
            key={attempt.id}
            className="rounded-lg border border-bc-border bg-bc-surface p-2.5"
            data-testid="attempt-row"
          >
            <div className="flex items-center justify-between gap-2">
              <Badge tone={attemptTone(attempt.status)}>{attemptStatusLabel(attempt.status)}</Badge>
              <span className="text-[11px] text-bc-muted">
                {new Date(attempt.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="m-0 mt-1.5 text-xs text-bc-muted">
              {attemptModeLabel(attempt.mode)} · {attempt.language} · {attempt.passed}/
              {attempt.total} tests
            </p>
            <p className="m-0 mt-1 text-[11px] text-bc-muted">
              {attempt.hintsUsed > 0
                ? `${attempt.hintsUsed} hint${attempt.hintsUsed === 1 ? '' : 's'} used`
                : 'No hints used'}
              {attempt.solutionViewed ? ' · solution viewed' : ''}
            </p>
            {attempt.plan ? (
              <details className="mt-1.5 text-xs text-bc-muted">
                <summary className="cursor-pointer">Plan</summary>
                <p className="m-0 mt-1 whitespace-pre-wrap">{attempt.plan}</p>
              </details>
            ) : null}
            <div className="mt-2 flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void restore(attempt.id)}
                disabled={busy === attempt.id}
                data-testid="restore-attempt"
              >
                Restore code
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void openTags(attempt.id)}
                disabled={busy === attempt.id}
                data-testid="edit-attempt-tags"
              >
                {editing === attempt.id ? 'Close tags' : 'Tags'}
              </Button>
            </div>
            {editing === attempt.id ? (
              <div className="mt-2 border-t border-bc-border pt-2" data-testid="tag-picker">
                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-1.5 text-[11px] text-bc-text"
                      title={tag.description ?? undefined}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                      />
                      {tag.label}
                    </label>
                  ))}
                </div>
                <Button
                  className="mt-2"
                  size="sm"
                  variant="secondary"
                  onClick={() => void saveTags(attempt.id)}
                  disabled={busy === attempt.id}
                  data-testid="save-attempt-tags"
                >
                  Save tags
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

function attemptModeLabel(mode: AttemptSummary['mode']): string {
  if (mode === 'submit') {
    return 'Submit'
  }

  return mode === 'review' ? 'Review' : 'Sample'
}

function attemptTone(status: string): 'neutral' | 'success' | 'danger' {
  if (status === 'accepted') {
    return 'success'
  }

  if (status === 'wrong_answer' || status === 'compile_error' || status === 'runtime_error') {
    return 'danger'
  }

  return 'neutral'
}

function attemptStatusLabel(status: string): string {
  const label = status.replaceAll('_', ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}
