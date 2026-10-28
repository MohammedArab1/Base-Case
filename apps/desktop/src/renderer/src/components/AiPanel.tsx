import { useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import type {
  AiContext,
  AiConversationTurn,
  AiDesignContext,
  AiEvent,
  AiFeature,
  AiMistakeTagsResult,
  AiPreview,
  AiProviderStatus,
  AiRequest,
  AiStructuredResult,
} from '../../../shared/types'
import { useSettings } from '../settings'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { AiResult } from './AiResult'

type CodingFeature = Exclude<AiFeature, 'designNotes' | 'followUp' | 'concept'>
type DesignFeature = 'designNotes' | 'followUp'

interface AiPanelProps {
  readonly variant: 'coding' | 'design'
  readonly context?: AiContext
  readonly design?: AiDesignContext
  readonly hasFailure?: boolean
  readonly hasPlan?: boolean
  readonly priorHints?: readonly string[]
  readonly disabledReason?: string
  /** Increment to open the explain-failure preview from outside the panel. */
  readonly trigger?: number
  readonly onAttemptsChanged?: () => void
}

export function AiPanel({
  variant,
  context,
  design,
  hasFailure = false,
  hasPlan = false,
  priorHints,
  disabledReason,
  trigger = 0,
  onAttemptsChanged,
}: AiPanelProps): JSX.Element {
  const { settings } = useSettings()
  const [status, setStatus] = useState<AiProviderStatus | null>(null)
  const [preview, setPreview] = useState<{ request: AiRequest; data: AiPreview } | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AiStructuredResult | null>(null)
  const [rawText, setRawText] = useState('')
  const [warning, setWarning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hintLevel, setHintLevel] = useState(1)
  const [question, setQuestion] = useState('')
  const [history, setHistory] = useState<readonly AiConversationTurn[]>([])
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [lastFeature, setLastFeature] = useState<AiFeature | null>(null)
  const activeRef = useRef<{ requestId: string; unsubscribe: () => void } | null>(null)
  const lastQuestionRef = useRef('')

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

  const contextKey = variant === 'design' ? design?.scenarioId : context?.problemId

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
  }, [contextKey])

  const buildRequest = (feature: AiFeature): AiRequest => {
    const trimmed = question.trim()

    if (variant === 'design') {
      if (!design) {
        throw new Error('No design scenario is open.')
      }

      return {
        feature: feature as DesignFeature,
        design: {
          ...design,
          ...(trimmed ? { question: trimmed } : {}),
          ...(feature === 'followUp' && history.length > 0 ? { history } : {}),
        },
      }
    }

    if (!context) {
      throw new Error('No problem is open.')
    }

    return {
      feature: feature as CodingFeature,
      context: {
        ...context,
        ...(trimmed ? { question: trimmed } : {}),
        hintLevel,
        ...(priorHints && priorHints.length > 0 ? { priorHints } : {}),
      },
    }
  }

  const cleanup = (): void => {
    activeRef.current?.unsubscribe()
    activeRef.current = null
  }

  const openPreview = async (feature: AiFeature): Promise<void> => {
    setError(null)
    setFeedbackSent(false)

    try {
      const request = buildRequest(feature)
      const data = await window.baseCase.ai.preview(request)
      setPreview({ request, data })
    } catch (previewError: unknown) {
      setError(previewError instanceof Error ? previewError.message : String(previewError))
    }
  }

  const openPreviewRef = useRef(openPreview)
  openPreviewRef.current = openPreview
  const lastTriggerRef = useRef(trigger)

  useEffect(() => {
    if (trigger > lastTriggerRef.current) {
      lastTriggerRef.current = trigger
      void openPreviewRef.current('explain')
    }
  }, [trigger])

  const start = async (request: AiRequest): Promise<void> => {
    setPreview(null)
    setLoading(true)
    setResult(null)
    setRawText('')
    setWarning(null)
    setError(null)
    setFeedbackSent(false)
    setLastFeature(request.feature)
    lastQuestionRef.current = question.trim()

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

        const followUpQuestion =
          event.result && 'question' in event.result ? event.result.question : null

        if (request.feature === 'followUp' && followUpQuestion) {
          const answer = lastQuestionRef.current
          setHistory((current) => [
            ...current,
            ...(answer ? [{ role: 'user' as const, content: answer }] : []),
            { role: 'assistant' as const, content: followUpQuestion },
          ])
          setQuestion('')
        }
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
    if (!lastFeature) {
      return
    }

    try {
      await window.baseCase.ai.feedback({ feature: lastFeature, reason })
      setFeedbackSent(true)
    } catch (feedbackError: unknown) {
      setError(feedbackError instanceof Error ? feedbackError.message : String(feedbackError))
    }
  }

  const copyContext = async (): Promise<void> => {
    if (!preview) {
      return
    }

    try {
      await navigator.clipboard.writeText(preview.data.text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setError('Could not copy the context.')
    }
  }

  const canUse = (feature: AiFeature): boolean =>
    Boolean(status?.enabled) &&
    settings.aiEnabled &&
    settings.aiFeatures[feature] &&
    !loading &&
    !disabledReason

  const hasNotes = design
    ? Object.values(design.notes).some((value) => value.trim().length > 0)
    : false

  const providerLabel = status
    ? status.enabled
      ? status.model || status.type
      : 'not configured'
    : 'checking…'

  const sendBlocked =
    !settings.aiEnabled ||
    !status?.enabled ||
    (preview ? !settings.aiFeatures[preview.request.feature] : false)

  return (
    <div className="p-3" data-testid="ai-panel">
      <div className="flex items-start justify-between gap-2">
        <p className="m-0 text-xs leading-relaxed text-bc-muted">
          Experimental. A Socratic assistant grounded in your code and the first failing test.
          Hidden tests are never sent. Short answers are buffered so guardrails can run before you
          see them. Pre-authored hints remain the primary path.
        </p>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Badge>Experimental</Badge>
          <Badge tone={status?.enabled ? 'success' : 'neutral'}>{providerLabel}</Badge>
        </div>
      </div>

      {disabledReason ? (
        <div className="callout" data-testid="ai-unavailable">
          {disabledReason}
        </div>
      ) : !settings.aiEnabled ? (
        <div className="callout" data-testid="ai-disabled">
          AI is turned off. Enable it in Settings to use these tools.
        </div>
      ) : status && !status.enabled ? (
        <div className="callout" data-testid="ai-not-configured">
          No provider is configured. Add one in Settings, or choose the mock provider.
        </div>
      ) : null}

      {variant === 'coding' ? (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void openPreview('explain')}
              disabled={!canUse('explain') || !hasFailure}
              data-testid="ai-explain"
            >
              Explain failure
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void openPreview('hint')}
              disabled={!canUse('hint')}
              data-testid="ai-hint"
            >
              Get a hint
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void openPreview('approach')}
              disabled={!canUse('approach') || !hasPlan}
              data-testid="ai-approach"
            >
              Review approach
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void openPreview('complexity')}
              disabled={!canUse('complexity')}
              data-testid="ai-complexity"
            >
              Review complexity
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void openPreview('mistakeTags')}
              disabled={!canUse('mistakeTags') || !hasFailure}
              data-testid="ai-mistake-tags"
            >
              Suggest tags
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void openPreview('explainBack')}
              disabled={!canUse('explainBack') || question.trim().length === 0}
              data-testid="ai-explain-back"
            >
              Check my explanation
            </Button>
          </div>

          <label className="flex items-center gap-2 text-xs text-bc-muted">
            <span>Hint level</span>
            <select
              className="input"
              aria-label="Hint level"
              value={hintLevel}
              onChange={(event) => setHintLevel(Number(event.target.value))}
              disabled={loading}
            >
              <option value={1}>1 — observation</option>
              <option value={2}>2 — concept</option>
              <option value={3}>3 — approach</option>
              <option value={4}>4 — pseudocode</option>
            </select>
          </label>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void openPreview('designNotes')}
            disabled={!canUse('designNotes') || !hasNotes}
            data-testid="ai-design-notes"
          >
            Review my notes
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void openPreview('followUp')}
            disabled={!canUse('followUp')}
            data-testid="ai-follow-up"
          >
            Ask me a follow-up
          </Button>
        </div>
      )}

      <label className="mt-3 flex flex-col gap-1 text-xs text-bc-muted">
        <span>
          {variant === 'design'
            ? 'Your answer or question (optional)'
            : 'Ask a question or explain your solution (optional)'}
        </span>
        <textarea
          className="input"
          rows={2}
          value={question}
          aria-label="AI question"
          onChange={(event) => setQuestion(event.target.value)}
          disabled={loading}
        />
      </label>

      {loading ? (
        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-bc-muted">
          <span>{rawText ? 'Writing…' : 'Waiting for the provider…'}</span>
          <Button size="sm" variant="ghost" onClick={cancel} data-testid="ai-cancel">
            Cancel
          </Button>
        </div>
      ) : null}

      {error ? (
        <div className="callout callout-error" role="alert" data-testid="ai-error">
          {error}
        </div>
      ) : null}

      {warning ? (
        <div className="callout" data-testid="ai-warning">
          {warning}
        </div>
      ) : null}

      {result || (!loading && rawText) ? (
        <AiResult feature={lastFeature ?? 'explain'} result={result} rawText={rawText} />
      ) : null}

      {lastFeature === 'mistakeTags' && result && 'suggestions' in result && context?.problemId ? (
        <MistakeTagSuggestions
          problemId={context.problemId}
          result={result as AiMistakeTagsResult}
          onApplied={onAttemptsChanged}
        />
      ) : null}

      {result || (!loading && rawText) ? (
        <div className="mt-3 border-t border-bc-border pt-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-bc-muted">Was this helpful?</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void sendFeedback('unhelpful')}
              disabled={feedbackSent}
              data-testid="ai-feedback-unhelpful"
            >
              Unhelpful
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void sendFeedback('leaky')}
              disabled={feedbackSent}
              data-testid="ai-feedback-leaky"
            >
              Leaked a solution
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void sendFeedback('wrong')}
              disabled={feedbackSent}
              data-testid="ai-feedback-wrong"
            >
              Incorrect
            </Button>
          </div>
          {feedbackSent ? (
            <p className="m-0 mt-1 text-xs text-bc-muted">Saved locally. Thanks.</p>
          ) : null}
        </div>
      ) : null}

      {preview ? (
        <div className="modal-backdrop">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-preview-title"
            data-testid="ai-preview"
          >
            <h2 id="ai-preview-title">AI context preview</h2>
            <p className="muted">
              This is exactly what would be sent to the configured provider. Hidden tests beyond the
              first failure are not included.
            </p>

            <p className="muted small" data-testid="ai-preview-target">
              Provider: {status?.type ?? 'none'} · Model: {status?.model || '—'}
              {status?.type === 'openai-compatible'
                ? ` · Endpoint: ${status.baseUrl || 'not set'}`
                : ''}
            </p>

            {status?.type === 'openai-compatible' ? (
              <p className="muted small">
                With a cloud provider, this context leaves your machine. Use a local endpoint such
                as Ollama or LM Studio to keep it on your network.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Badge tone="accent">
                ~{preview.data.estimatedTokens} / {preview.data.budgetTokens} input tokens
              </Badge>
              <Badge>max {preview.data.maxOutputTokens} output tokens</Badge>
              <Badge>{Math.ceil(preview.data.text.length / 1024)} KB</Badge>
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
                className="btn btn-secondary"
                onClick={() => void copyContext()}
              >
                {copied ? 'Copied' : 'Copy context'}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void start(preview.request)}
                disabled={sendBlocked}
                data-testid="ai-send"
              >
                Send to provider
              </button>
            </div>

            {sendBlocked ? (
              <p className="muted small">
                AI is off or this feature is disabled. Enable it in Settings before sending.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

const mistakeTagLabels: Record<string, string> = {
  'off-by-one': 'Off-by-one',
  'missed-edge-case': 'Missed edge case',
  'wrong-complexity': 'Wrong complexity',
  'misread-problem': 'Misread problem',
  'data-structure-choice': 'Wrong data structure',
  'state-management': 'State management',
  syntax: 'Syntax or API',
  'time-pressure': 'Time pressure',
}

function MistakeTagSuggestions({
  problemId,
  result,
  onApplied,
}: {
  readonly problemId: string
  readonly result: AiMistakeTagsResult
  readonly onApplied?: () => void
}): JSX.Element {
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    () => new Set(result.suggestions.map((suggestion) => suggestion.tagId)),
  )
  const [status, setStatus] = useState<'idle' | 'applying' | 'applied' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    setSelected(new Set(result.suggestions.map((suggestion) => suggestion.tagId)))
    setStatus('idle')
    setMessage('')
  }, [result])

  const toggle = (tagId: string): void => {
    setSelected((current) => {
      const next = new Set(current)

      if (next.has(tagId)) {
        next.delete(tagId)
      } else {
        next.add(tagId)
      }

      return next
    })
  }

  const apply = async (): Promise<void> => {
    if (selected.size === 0) {
      setStatus('error')
      setMessage('Select at least one tag to apply.')
      return
    }

    setStatus('applying')
    setMessage('')

    try {
      const attempts = await window.baseCase.attempts.list(problemId)
      const latest = attempts[0]

      if (!latest) {
        throw new Error('Run the problem first, then apply tags to the latest attempt.')
      }

      const detail = await window.baseCase.attempts.get(latest.id)
      const merged = [...new Set([...detail.mistakeTagIds, ...selected])]
      await window.baseCase.attempts.tag({ attemptId: latest.id, tagIds: merged })
      setStatus('applied')
      setMessage(`Applied to the latest ${latest.mode} attempt.`)
      onApplied?.()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <section
      className="mt-3 rounded-lg border border-bc-border bg-bc-surface-muted p-2.5"
      data-testid="ai-mistake-suggestions"
      aria-live="polite"
    >
      <h4 className="m-0 text-xs font-semibold uppercase tracking-wide text-bc-muted">
        Suggested mistake tags
      </h4>
      {result.suggestions.length === 0 ? (
        <p className="m-0 mt-1.5 text-xs leading-relaxed text-bc-muted">
          No tag was justified by the available evidence.
        </p>
      ) : (
        <>
          <ul className="m-0 mt-1.5 flex list-none flex-col gap-1.5 p-0">
            {result.suggestions.map((suggestion) => (
              <li key={suggestion.tagId}>
                <label className="flex items-start gap-2 text-xs leading-relaxed text-bc-text">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={selected.has(suggestion.tagId)}
                    onChange={() => toggle(suggestion.tagId)}
                    data-testid={`ai-mistake-tag-${suggestion.tagId}`}
                  />
                  <span>
                    <strong>{mistakeTagLabels[suggestion.tagId] ?? suggestion.tagId}</strong>
                    <span className="block text-bc-muted">{suggestion.reason}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void apply()}
              disabled={status === 'applying'}
              data-testid="ai-apply-mistake-tags"
            >
              {status === 'applying' ? 'Applying…' : 'Apply selected tags'}
            </Button>
            {message ? (
              <span
                className={status === 'error' ? 'text-xs text-bc-danger' : 'text-xs text-bc-muted'}
              >
                {message}
              </span>
            ) : null}
          </div>
        </>
      )}
    </section>
  )
}
