import { useEffect, useMemo, useRef, useState } from 'react'
import type { JSX } from 'react'
import type {
  AiEvent,
  AiPreview,
  AiProviderStatus,
  AiRequest,
  AiStructuredResult,
  LessonDetail,
} from '../../../shared/types'
import { useSettings } from '../settings'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { AiResult } from './AiResult'

interface LessonTutorProps {
  readonly lesson: LessonDetail
}

/**
 * Optional clarification for a lesson. The lesson itself is the source of
 * truth; AI is an extra explanation layer and never required to read it.
 */
export function LessonTutor({ lesson }: LessonTutorProps): JSX.Element {
  const { settings } = useSettings()
  const [status, setStatus] = useState<AiProviderStatus | null>(null)
  const [question, setQuestion] = useState('')
  const [focus, setFocus] = useState('')
  const [preview, setPreview] = useState<{ request: AiRequest; data: AiPreview } | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AiStructuredResult | null>(null)
  const [rawText, setRawText] = useState('')
  const [warning, setWarning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const activeRef = useRef<{ requestId: string; unsubscribe: () => void } | null>(null)

  const sections = useMemo(
    () =>
      Array.from(lesson.content.matchAll(/^##\s+(.+)$/gm))
        .map((match) => match[1]?.trim() ?? '')
        .filter((title) => title.length > 0),
    [lesson.content],
  )

  useEffect(() => {
    let cancelled = false

    void window.baseCase.ai
      .getStatus()
      .then((nextStatus) => {
        if (!cancelled) {
          setStatus(nextStatus)
        }
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return () => {
      const active = activeRef.current

      if (active) {
        if (active.requestId) {
          void window.baseCase.ai.cancel(active.requestId)
        }
        active.unsubscribe()
        activeRef.current = null
      }
    }
  }, [])

  const cleanup = (): void => {
    activeRef.current?.unsubscribe()
    activeRef.current = null
  }

  const canAsk = Boolean(status?.enabled) && settings.aiEnabled && settings.aiFeatures.concept
  const providerLabel = status
    ? status.enabled
      ? status.model || status.type
      : 'not configured'
    : 'checking…'

  const openPreview = async (): Promise<void> => {
    const trimmed = question.trim()

    if (trimmed.length === 0) {
      setError('Write a question first.')
      return
    }

    setError(null)
    setResult(null)
    setRawText('')
    setWarning(null)
    setFeedbackSent(false)

    const request: AiRequest = {
      feature: 'concept',
      concept: {
        lessonId: lesson.id,
        question: trimmed,
        ...(focus ? { section: focus } : {}),
      },
    }

    try {
      const data = await window.baseCase.ai.preview(request)
      setPreview({ request, data })
    } catch (previewError: unknown) {
      setError(previewError instanceof Error ? previewError.message : String(previewError))
    }
  }

  const start = async (request: AiRequest): Promise<void> => {
    setPreview(null)
    setLoading(true)
    setResult(null)
    setRawText('')
    setWarning(null)
    setError(null)
    setFeedbackSent(false)

    let expectedId: string | null = null
    const pending: AiEvent[] = []

    const handle = (event: AiEvent): void => {
      if (event.type === 'chunk') {
        setRawText((current) => current + event.text)
        return
      }

      if (event.type === 'done') {
        setLoading(false)
        setRawText(event.text)
        setResult(event.result ?? null)
        setWarning(event.warning ?? null)
        cleanup()
        return
      }

      setLoading(false)
      setRawText('')
      setError(event.code === 'cancelled' ? 'Request cancelled.' : event.message)
      cleanup()
    }

    const unsubscribe = window.baseCase.ai.onEvent((event) => {
      if (expectedId === null) {
        pending.push(event)
        return
      }

      if (event.requestId === expectedId) {
        handle(event)
      }
    })

    activeRef.current = { requestId: '', unsubscribe }

    try {
      const response = await window.baseCase.ai.run(request)
      expectedId = response.requestId
      activeRef.current = { requestId: response.requestId, unsubscribe }

      for (const event of pending) {
        if (event.requestId === response.requestId) {
          handle(event)
        }
      }
      pending.length = 0
    } catch (runError: unknown) {
      setLoading(false)
      setRawText('')
      setError(runError instanceof Error ? runError.message : String(runError))
      cleanup()
    }
  }

  const cancel = (): void => {
    const active = activeRef.current

    if (active?.requestId) {
      void window.baseCase.ai.cancel(active.requestId)
    }
  }

  const sendFeedback = async (reason: 'unhelpful' | 'leaky' | 'wrong'): Promise<void> => {
    try {
      await window.baseCase.ai.feedback({ feature: 'concept', reason })
      setFeedbackSent(true)
    } catch (feedbackError: unknown) {
      setError(feedbackError instanceof Error ? feedbackError.message : String(feedbackError))
    }
  }

  return (
    <section className="lesson-card lesson-tutor" aria-labelledby="lesson-tutor-heading">
      <div className="lesson-card-heading">
        <h3 id="lesson-tutor-heading">Ask AI to clarify</h3>
        <Badge tone={status?.enabled ? 'success' : 'neutral'}>{providerLabel}</Badge>
      </div>
      <p className="muted small">
        Optional. Only the selected lesson excerpt and your question are sent, after you approve the
        preview. The lesson stays fully readable without AI.
      </p>

      {!settings.aiEnabled ? (
        <div className="callout" data-testid="lesson-ai-disabled">
          AI is turned off. Enable it in Settings to ask for a clarification.
        </div>
      ) : status && !status.enabled ? (
        <div className="callout" data-testid="lesson-ai-not-configured">
          No AI provider is configured. Add one in Settings, or use the mock provider.
        </div>
      ) : status && !settings.aiFeatures.concept ? (
        <div className="callout" data-testid="lesson-ai-feature-off">
          Lesson clarification is turned off in Settings.
        </div>
      ) : null}

      <label className="lesson-field">
        <span>Focus</span>
        <select
          className="input"
          value={focus}
          onChange={(event) => setFocus(event.target.value)}
          disabled={loading}
          aria-label="Lesson section to include"
        >
          <option value="">Whole lesson</option>
          {sections.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>
      </label>

      <label className="lesson-field">
        <span>Your question</span>
        <textarea
          className="input"
          rows={3}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Can you explain this in simpler words?"
          disabled={loading}
          aria-label="Question about this lesson"
          data-testid="lesson-ai-question"
        />
      </label>

      <Button
        size="sm"
        variant="secondary"
        onClick={() => void openPreview()}
        disabled={!canAsk || loading || question.trim().length === 0}
        data-testid="lesson-ai-ask"
      >
        Preview and ask
      </Button>

      {loading ? (
        <div className="lesson-ai-status">
          <span>{rawText ? 'Writing…' : 'Waiting for the provider…'}</span>
          <Button size="sm" variant="ghost" onClick={cancel}>
            Cancel
          </Button>
        </div>
      ) : null}

      {error ? (
        <div className="callout callout-error" role="alert" data-testid="lesson-ai-error">
          {error}
        </div>
      ) : null}

      {warning ? (
        <div className="callout" data-testid="lesson-ai-warning">
          {warning}
        </div>
      ) : null}

      {result || (!loading && rawText) ? (
        <AiResult feature="concept" result={result} rawText={rawText} />
      ) : null}

      {result || (!loading && rawText) ? (
        <div className="lesson-ai-feedback">
          <span className="muted small">Was this helpful?</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void sendFeedback('unhelpful')}
            disabled={feedbackSent}
          >
            Unhelpful
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void sendFeedback('leaky')}
            disabled={feedbackSent}
          >
            Too much
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void sendFeedback('wrong')}
            disabled={feedbackSent}
          >
            Incorrect
          </Button>
        </div>
      ) : null}

      {preview ? (
        <div className="modal-backdrop">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lesson-ai-preview-title"
            data-testid="lesson-ai-preview"
          >
            <h2 id="lesson-ai-preview-title">AI context preview</h2>
            <p className="muted">
              This is exactly what would be sent to the configured provider. The lesson text stays
              on your machine until you send it.
            </p>
            <p className="muted small">
              Provider: {status?.type ?? 'none'} · Model: {status?.model || '—'}
              {status?.type === 'openai-compatible'
                ? ` · Endpoint: ${status.baseUrl || 'not set'}`
                : ''}
            </p>
            <div className="lesson-ai-badges">
              <Badge tone="accent">
                ~{preview.data.estimatedTokens} / {preview.data.budgetTokens} input tokens
              </Badge>
              <Badge>max {preview.data.maxOutputTokens} output tokens</Badge>
              {preview.data.redactions > 0 ? (
                <Badge tone="danger">{preview.data.redactions} secrets redacted</Badge>
              ) : null}
            </div>
            {preview.data.droppedSections.length > 0 ? (
              <p className="muted small">
                Dropped to fit the context window: {preview.data.droppedSections.join(', ')}.
              </p>
            ) : null}
            <pre className="ai-preview">{preview.data.text}</pre>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setPreview(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void start(preview.request)}
                disabled={!canAsk}
                data-testid="lesson-ai-send"
              >
                Send to provider
              </button>
            </div>
            {!canAsk ? (
              <p className="muted small">
                AI is off or this feature is disabled. Enable it in Settings before sending.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
