import { useState } from 'react'
import type { JSX, ReactNode } from 'react'
import type { Language } from '../../../shared/types'
import { useSettings } from '../settings'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cn } from '../ui/cn'

interface OnboardingViewProps {
  readonly onFinish: (options?: { readonly openProblemId?: string }) => void
}

type Step = 0 | 1 | 2 | 3 | 4

interface ChoiceCardProps {
  readonly selected: boolean
  readonly title: string
  readonly description: ReactNode
  readonly onClick: () => void
  readonly testId: string
}

function ChoiceCard({
  selected,
  title,
  description,
  onClick,
  testId,
}: ChoiceCardProps): JSX.Element {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bc-accent',
        selected
          ? 'border-bc-accent bg-bc-accent-soft'
          : 'border-bc-border bg-bc-surface hover:bg-bc-surface-muted',
      )}
    >
      <span className="block text-sm font-semibold text-bc-text">{title}</span>
      <span className="mt-1 block text-xs leading-relaxed text-bc-muted">{description}</span>
    </button>
  )
}

const goalOptions = [15, 30, 45, 60, 90] as const

export function OnboardingView({ onFinish }: OnboardingViewProps): JSX.Element {
  const { settings, update } = useSettings()
  const [step, setStep] = useState<Step>(0)
  const [language, setLanguage] = useState<Language>(settings.language)
  const [dailyGoal, setDailyGoal] = useState(
    goalOptions.includes(settings.dailyGoalMinutes as (typeof goalOptions)[number])
      ? settings.dailyGoalMinutes
      : 30,
  )
  const [reviewReminders, setReviewReminders] = useState(settings.reviewReminders)
  const [aiChoice, setAiChoice] = useState<'none' | 'mock'>('none')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const complete = async (destination: 'today' | 'sample', applySetup = true): Promise<void> => {
    setSaving(true)
    setError(null)

    try {
      if (applySetup && aiChoice === 'mock') {
        await window.baseCase.ai.saveConfig({ type: 'mock', baseUrl: '', model: 'mock' })
      }

      await update(
        applySetup
          ? {
              language,
              dailyGoalMinutes: dailyGoal,
              reviewReminders,
              onboardingCompleted: true,
            }
          : { onboardingCompleted: true },
      )

      onFinish(destination === 'sample' ? { openProblemId: 'core/pair-sum' } : undefined)
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : String(saveError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="onboarding-shell flex min-h-screen items-center justify-center bg-bc-bg p-6 text-bc-text">
      <div className="w-full max-w-2xl rounded-2xl border border-bc-border bg-bc-surface p-6 shadow-[var(--shadow)] sm:p-8">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-bc-text text-sm font-bold text-bc-bg">
              BC
            </span>
            <div>
              <p className="text-sm font-semibold">Base Case</p>
              <p className="text-xs text-bc-muted">Practice with intent</p>
            </div>
          </div>
          {step < 4 ? (
            <button
              type="button"
              data-testid="onboarding-skip"
              onClick={() => void complete('today', false)}
              disabled={saving}
              className="rounded-md border-0 bg-transparent px-2 py-1 text-xs text-bc-muted hover:text-bc-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bc-accent disabled:opacity-50"
            >
              Skip setup
            </button>
          ) : null}
        </header>

        {step >= 1 && step <= 3 ? (
          <div className="mb-6 flex gap-2" aria-label={`Step ${step} of 3`}>
            {['Language', 'Daily goal', 'AI'].map((label, index) => {
              const position = index + 1
              return (
                <div key={label} className="flex-1">
                  <div
                    className={cn(
                      'h-1 rounded-full',
                      step >= position ? 'bg-bc-accent' : 'bg-bc-surface-muted',
                    )}
                  />
                  <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-bc-muted">
                    {label}
                  </p>
                </div>
              )
            })}
          </div>
        ) : null}

        {step === 0 ? (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge tone="success">Works offline</Badge>
              <Badge>No account</Badge>
              <Badge>No telemetry</Badge>
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Practice the loop, not the answer.
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-bc-muted">
                Run real code against hidden tests, learn from the first failure, and come back to
                it on a schedule. Everything stays on this machine.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-bc-text">
              <li className="flex gap-2">
                <span className="text-bc-success">✓</span>A real Go judge for Python and TypeScript
              </li>
              <li className="flex gap-2">
                <span className="text-bc-success">✓</span>
                Hints and explanations when you get stuck
              </li>
              <li className="flex gap-2">
                <span className="text-bc-success">✓</span>
                Local attempts, drafts, and design scenes
              </li>
            </ul>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="primary" data-testid="onboarding-start" onClick={() => setStep(1)}>
                Get started
              </Button>
              <Button
                variant="ghost"
                onClick={() => void complete('today', false)}
                disabled={saving}
              >
                Skip setup
              </Button>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold">What do you want to write first?</h2>
              <p className="mt-1 text-sm text-bc-muted">
                This sets the default editor language. You can switch per problem.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceCard
                selected={language === 'python'}
                title="Python"
                description="Concise syntax and the most common interview language."
                onClick={() => setLanguage('python')}
                testId="onboarding-language-python"
              />
              <ChoiceCard
                selected={language === 'typescript'}
                title="TypeScript"
                description="Typed JavaScript, useful for frontend and full-stack roles."
                onClick={() => setLanguage('typescript')}
                testId="onboarding-language-typescript"
              />
            </div>
            <div className="flex justify-between gap-2 pt-1">
              <Button variant="ghost" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button
                variant="primary"
                data-testid="onboarding-language-next"
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold">How much practice fits your day?</h2>
              <p className="mt-1 text-sm text-bc-muted">
                A small daily goal beats a weekend cram. You can change this later.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {goalOptions.map((minutes) => (
                <ChoiceCard
                  key={minutes}
                  selected={dailyGoal === minutes}
                  title={`${minutes} min`}
                  description={minutes <= 30 ? 'Light' : minutes <= 60 ? 'Steady' : 'Deep work'}
                  onClick={() => setDailyGoal(minutes)}
                  testId={`onboarding-goal-${minutes}`}
                />
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-bc-muted">
              <input
                type="checkbox"
                className="h-4 w-4 accent-bc-accent"
                checked={reviewReminders}
                onChange={(event) => setReviewReminders(event.target.checked)}
              />
              Show review reminders when something is due
            </label>
            <div className="flex justify-between gap-2 pt-1">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="primary"
                data-testid="onboarding-goal-next"
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold">Add a hint engine?</h2>
              <p className="mt-1 text-sm text-bc-muted">
                Optional. Every core feature works offline without AI.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceCard
                selected={aiChoice === 'none'}
                title="No AI"
                description="Just the judge, hints, and your local notes."
                onClick={() => setAiChoice('none')}
                testId="onboarding-ai-none"
              />
              <ChoiceCard
                selected={aiChoice === 'mock'}
                title="Mock provider"
                description="Try the Socratic hint panel with canned text. No network."
                onClick={() => setAiChoice('mock')}
                testId="onboarding-ai-mock"
              />
            </div>
            <p className="text-xs leading-relaxed text-bc-muted">
              A real OpenAI-compatible provider can be configured later in Settings. Keys are
              encrypted with the OS keychain and only sent to the provider you choose.
            </p>
            {error ? <p className="text-xs text-bc-danger">{error}</p> : null}
            <div className="flex justify-between gap-2 pt-1">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button variant="primary" data-testid="onboarding-finish" onClick={() => setStep(4)}>
                Finish setup
              </Button>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold">You&apos;re set.</h2>
              <p className="mt-1 text-sm text-bc-muted">
                Start with the bundled sample problem or go straight to Today.
              </p>
            </div>
            <dl className="grid gap-3 rounded-xl border border-bc-border bg-bc-surface-muted p-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-bc-muted">Language</dt>
                <dd className="mt-1 font-medium">
                  {language === 'python' ? 'Python' : 'TypeScript'}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-bc-muted">Daily goal</dt>
                <dd className="mt-1 font-medium">{dailyGoal} minutes</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-bc-muted">AI</dt>
                <dd className="mt-1 font-medium">
                  {aiChoice === 'mock' ? 'Mock provider' : 'None'}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-bc-muted">
              Pair Sum is an original 5-sample / 39-hidden-test problem with progressive hints.
            </p>
            {error ? <p className="text-xs text-bc-danger">{error}</p> : null}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="primary"
                data-testid="onboarding-open-sample"
                onClick={() => void complete('sample')}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Start with Pair Sum'}
              </Button>
              <Button
                variant="secondary"
                data-testid="onboarding-go-today"
                onClick={() => void complete('today')}
                disabled={saving}
              >
                Go to Today
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
