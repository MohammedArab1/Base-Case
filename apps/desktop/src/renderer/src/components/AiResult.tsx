import type { JSX } from 'react'
import type {
  AiApproachResult,
  AiComplexityResult,
  AiDesignNotesResult,
  AiExplainResult,
  AiFeature,
  AiFollowUpResult,
  AiHintResult,
  AiStructuredResult,
} from '../../../shared/types'
import { Badge } from '../ui/Badge'

interface AiResultProps {
  readonly feature: AiFeature
  readonly result: AiStructuredResult | null
  readonly rawText: string
}

function confidenceTone(confidence: 'low' | 'medium' | 'high'): 'neutral' | 'accent' | 'success' {
  return confidence === 'high' ? 'success' : confidence === 'medium' ? 'accent' : 'neutral'
}

function ListSection({
  title,
  items,
  testId,
}: {
  readonly title: string
  readonly items: readonly string[]
  readonly testId: string
}): JSX.Element | null {
  if (items.length === 0) {
    return null
  }

  return (
    <section className="mt-3" data-testid={testId}>
      <h4 className="m-0 text-xs font-semibold uppercase tracking-wide text-bc-muted">{title}</h4>
      <ul className="m-0 mt-1 list-disc pl-5 text-sm leading-relaxed text-bc-text">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export function AiResult({ feature, result, rawText }: AiResultProps): JSX.Element {
  if (!result) {
    return (
      <pre
        className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-bc-text"
        data-testid="ai-raw-response"
      >
        {rawText}
      </pre>
    )
  }

  if (feature === 'explain') {
    const data = result as AiExplainResult

    return (
      <div className="mt-3" data-testid="ai-result-explain">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{data.bugType}</Badge>
          <Badge tone={confidenceTone(data.confidence)}>{data.confidence} confidence</Badge>
          {data.line !== null ? <Badge>line {data.line}</Badge> : null}
        </div>
        <p className="m-0 mt-2 text-sm font-medium leading-relaxed text-bc-text">{data.summary}</p>
        <p className="m-0 mt-2 text-sm leading-relaxed text-bc-muted">{data.evidence}</p>
        <p className="m-0 mt-3 rounded-lg border border-bc-border bg-bc-surface-muted p-2.5 text-sm leading-relaxed text-bc-text">
          {data.nextQuestion}
        </p>
      </div>
    )
  }

  if (feature === 'hint') {
    const data = result as AiHintResult

    return (
      <div className="mt-3" data-testid="ai-result-hint">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{data.concept}</Badge>
          <Badge>level {data.revealLevel}</Badge>
        </div>
        <p className="m-0 mt-2 text-sm leading-relaxed text-bc-text">{data.observation}</p>
        <p className="m-0 mt-2 text-sm leading-relaxed text-bc-muted">{data.insight}</p>
        <p className="m-0 mt-3 rounded-lg border border-bc-border bg-bc-surface-muted p-2.5 text-sm leading-relaxed text-bc-text">
          {data.nextStep}
        </p>
      </div>
    )
  }

  if (feature === 'approach') {
    const data = result as AiApproachResult

    return (
      <div className="mt-3" data-testid="ai-result-approach">
        <Badge tone={data.matchesIntendedPattern ? 'success' : 'neutral'}>
          {data.matchesIntendedPattern ? 'Matches the intended pattern' : 'Different approach'}
        </Badge>
        <ListSection title="Strengths" items={data.strengths} testId="ai-approach-strengths" />
        <ListSection title="Risks" items={data.risks} testId="ai-approach-risks" />
        <p className="m-0 mt-3 rounded-lg border border-bc-border bg-bc-surface-muted p-2.5 text-sm leading-relaxed text-bc-text">
          {data.suggestedQuestion}
        </p>
      </div>
    )
  }

  if (feature === 'complexity') {
    const data = result as AiComplexityResult

    return (
      <div className="mt-3" data-testid="ai-result-complexity">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-bc-border bg-bc-surface-muted p-2.5">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-bc-muted">
              Time
            </span>
            <strong className="text-sm text-bc-text">{data.time}</strong>
          </div>
          <div className="rounded-lg border border-bc-border bg-bc-surface-muted p-2.5">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-bc-muted">
              Space
            </span>
            <strong className="text-sm text-bc-text">{data.space}</strong>
          </div>
        </div>
        <p className="m-0 mt-2 text-sm leading-relaxed text-bc-muted">{data.reasoning}</p>
        <Badge className="mt-2" tone={confidenceTone(data.confidence)}>
          {data.confidence} confidence
        </Badge>
      </div>
    )
  }

  if (feature === 'designNotes') {
    const data = result as AiDesignNotesResult

    return (
      <div className="mt-3" data-testid="ai-result-design">
        <div className="flex flex-col gap-2">
          {data.dimensions.map((dimension) => (
            <div
              key={dimension.name}
              className="rounded-lg border border-bc-border bg-bc-surface p-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <strong className="text-sm text-bc-text">{dimension.name}</strong>
                <Badge tone={dimension.score >= 3 ? 'success' : 'neutral'}>
                  {dimension.score} / 4
                </Badge>
              </div>
              <p className="m-0 mt-1 text-xs leading-relaxed text-bc-muted">{dimension.evidence}</p>
              <p className="m-0 mt-1 text-xs leading-relaxed text-bc-text">
                Next: {dimension.nextStep}
              </p>
            </div>
          ))}
        </div>
        <ListSection title="Strengths" items={data.strengths} testId="ai-design-strengths" />
        <ListSection title="Gaps" items={data.gaps} testId="ai-design-gaps" />
        <ListSection
          title="Follow-up questions"
          items={data.followUpQuestions}
          testId="ai-design-followups"
        />
      </div>
    )
  }

  const data = result as AiFollowUpResult

  return (
    <div className="mt-3" data-testid="ai-result-followup">
      <p className="m-0 rounded-lg border border-bc-border bg-bc-surface-muted p-3 text-sm leading-relaxed text-bc-text">
        {data.question}
      </p>
    </div>
  )
}
