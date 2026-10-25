import { useCallback, useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import type { AttemptSummary } from '../../../shared/types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs'

export interface InspectorAiState {
  readonly hasFailure: boolean
  readonly text: string
  readonly loading: boolean
  readonly error: string | null
  onExplain(): void
}

interface InspectorProps {
  readonly problemId: string
  readonly problemTitle: string
  readonly attemptRefreshKey: number
  readonly ai: InspectorAiState
  readonly onClose: () => void
}

export function Inspector({
  problemId,
  problemTitle,
  attemptRefreshKey,
  ai,
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
            <AiTab ai={ai} />
          </TabsContent>
          <TabsContent value="notes" className="pt-0">
            <NotesTab problemId={problemId} problemTitle={problemTitle} />
          </TabsContent>
          <TabsContent value="history" className="pt-0">
            <HistoryTab problemId={problemId} refreshKey={attemptRefreshKey} />
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  )
}

function AiTab({ ai }: { readonly ai: InspectorAiState }): JSX.Element {
  return (
    <div className="p-3">
      <p className="m-0 text-xs leading-relaxed text-bc-muted">
        A Socratic nudge based on your code and the first failing test. Hidden tests are never sent.
      </p>

      {ai.hasFailure ? (
        <Button
          className="mt-3"
          size="sm"
          variant="secondary"
          onClick={ai.onExplain}
          disabled={ai.loading}
          data-testid="inspector-explain"
        >
          {ai.loading ? 'Waiting…' : ai.text ? 'Explain again' : 'Explain the first failure'}
        </Button>
      ) : (
        <p className="m-0 mt-3 text-xs leading-relaxed text-bc-muted">
          Run samples or submit first. The inspector can then explain the earliest failure.
        </p>
      )}

      {ai.error ? (
        <div className="mt-3 rounded-lg border border-bc-danger bg-bc-danger-soft p-2.5 text-xs text-bc-danger">
          {ai.error}
        </div>
      ) : null}

      {ai.text ? (
        <div
          className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-bc-text"
          data-testid="inspector-ai-response"
        >
          {ai.text}
        </div>
      ) : null}

      {ai.loading && !ai.text ? (
        <p className="m-0 mt-3 text-xs text-bc-muted">Waiting for the provider…</p>
      ) : null}
    </div>
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
      <p className="m-0 mt-2 text-[11px] text-bc-muted" data-testid="notes-status">
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
}: {
  readonly problemId: string
  readonly refreshKey: number
}): JSX.Element {
  const [attempts, setAttempts] = useState<readonly AttemptSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    <ul className="m-0 flex list-none flex-col gap-2 p-3" data-testid="attempt-history">
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
            {attempt.mode === 'submit' ? 'Submit' : 'Sample'} · {attempt.language} ·{' '}
            {attempt.passed}/{attempt.total} tests
          </p>
        </li>
      ))}
    </ul>
  )
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
