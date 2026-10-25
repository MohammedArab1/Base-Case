import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import type { JSX } from 'react'
import type { ProblemSummary, SectionId } from '../../shared/types'
import { CommandPalette } from './components/CommandPalette'
import type { Command } from './components/CommandPalette'
import { matchesShortcut, shortcutLabel, shortcuts } from './lib/shortcuts'
import { useSettings } from './settings'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Tooltip } from './ui/Tooltip'
import { OnboardingView } from './views/OnboardingView'

const CodingView = lazy(() =>
  import('./views/CodingView').then((module) => ({ default: module.CodingView })),
)
const DesignView = lazy(() =>
  import('./views/DesignView').then((module) => ({ default: module.DesignView })),
)
const SettingsView = lazy(() =>
  import('./views/SettingsView').then((module) => ({ default: module.SettingsView })),
)
const ReviewView = lazy(() =>
  import('./views/ReviewView').then((module) => ({ default: module.ReviewView })),
)
const TodayView = lazy(() =>
  import('./views/TodayView').then((module) => ({ default: module.TodayView })),
)
const ProgressView = lazy(() =>
  import('./views/ProgressView').then((module) => ({ default: module.ProgressView })),
)

interface Section {
  readonly id: SectionId
  readonly label: string
  readonly title: string
  readonly description: string
}

const sections: readonly Section[] = [
  {
    id: 'today',
    label: 'Today',
    title: 'Today',
    description: 'Reviews, a place to continue, and one useful next step.',
  },
  {
    id: 'coding',
    label: 'Coding',
    title: 'Coding practice',
    description: 'Work through patterns with sample runs, hidden tests, and hints.',
  },
  {
    id: 'design',
    label: 'System Design',
    title: 'System design',
    description: 'Sketch an architecture and keep the scene local.',
  },
  {
    id: 'review',
    label: 'Review',
    title: 'Review',
    description: 'One queue for coding problems and design scenarios.',
  },
  {
    id: 'progress',
    label: 'Progress',
    title: 'Progress',
    description: 'Pattern coverage, mistake tags, and practice history.',
  },
  {
    id: 'settings',
    label: 'Settings',
    title: 'Settings',
    description: 'Editor, runtimes, AI, data, and diagnostics.',
  },
]

function App(): JSX.Element {
  const { settings, ready: settingsReady, update } = useSettings()
  const [section, setSection] = useState<SectionId>('today')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [problems, setProblems] = useState<readonly ProblemSummary[]>([])
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null)
  const [reviewCardId, setReviewCardId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const active = sections.find((item) => item.id === section) ?? sections[0]!
  const api = typeof window !== 'undefined' && 'baseCase' in window ? window.baseCase : undefined

  useEffect(() => {
    if (!api) {
      setError('The desktop bridge is unavailable. Open this window through Electron.')
      setLoading(false)
      return
    }

    let cancelled = false

    void api.content
      .list()
      .then((nextProblems) => {
        if (!cancelled) {
          setProblems(nextProblems)
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : String(loadError))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [api])

  useEffect(() => {
    if (!api) {
      return
    }

    const reload = (): void => {
      void api.content
        .list()
        .then((nextProblems) => {
          setProblems(nextProblems)
          setSelectedProblemId((current) =>
            current && nextProblems.some((problem) => problem.id === current) ? current : null,
          )
        })
        .catch((loadError: unknown) => {
          setError(loadError instanceof Error ? loadError.message : String(loadError))
        })
    }

    window.addEventListener('base-case:content-changed', reload)
    return () => window.removeEventListener('base-case:content-changed', reload)
  }, [api])

  const openProblem = (problemId: string): void => {
    setReviewCardId(null)
    setSelectedProblemId(problemId)
    setSection('coding')
  }

  const startReview = useCallback((problemId: string, cardId: string): void => {
    setReviewCardId(cardId)
    setSelectedProblemId(problemId)
    setSection('coding')
  }, [])

  const finishReview = useCallback((): void => {
    setReviewCardId(null)
    setSelectedProblemId(null)
    setSection('review')
  }, [])

  const closeProblem = useCallback((): void => {
    setSelectedProblemId(null)
    setReviewCardId(null)

    if (reviewCardId) {
      setSection('review')
    }
  }, [reviewCardId])

  const finishOnboarding = useCallback((options?: { readonly openProblemId?: string }): void => {
    if (options?.openProblemId) {
      setSelectedProblemId(options.openProblemId)
      setSection('coding')
    }
  }, [])

  const resolvedTheme = useMemo<'light' | 'dark'>(() => {
    if (settings.theme !== 'system') {
      return settings.theme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }, [settings.theme])

  const commands = useMemo<readonly Command[]>(() => {
    const navigation = sections.map((item, index) => ({
      id: `nav-${item.id}`,
      label: `Go to ${item.title}`,
      section: 'Navigate',
      shortcut: shortcutLabel({ key: String(index + 1), meta: true }),
      run: () => setSection(item.id),
    }))

    return [
      ...navigation,
      {
        id: 'theme-system',
        label: 'Theme: follow system',
        section: 'Appearance',
        run: () => void update({ theme: 'system' }),
      },
      {
        id: 'theme-light',
        label: 'Theme: light',
        section: 'Appearance',
        run: () => void update({ theme: 'light' }),
      },
      {
        id: 'theme-dark',
        label: 'Theme: dark',
        section: 'Appearance',
        run: () => void update({ theme: 'dark' }),
      },
      {
        id: 'theme-toggle',
        label: `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`,
        section: 'Appearance',
        run: () => void update({ theme: resolvedTheme === 'dark' ? 'light' : 'dark' }),
      },
    ]
  }, [resolvedTheme, update])

  useEffect(() => {
    if (!settings.onboardingCompleted) {
      return
    }

    const handler = (event: KeyboardEvent): void => {
      if (matchesShortcut(event, shortcuts.commandPalette)) {
        event.preventDefault()
        setPaletteOpen((current) => !current)
        return
      }

      if (paletteOpen) {
        if (event.key === 'Escape') {
          setPaletteOpen(false)
        }
        return
      }

      const index = ['1', '2', '3', '4', '5', '6'].findIndex((key) =>
        matchesShortcut(event, { key, meta: true }),
      )
      const target = index >= 0 ? sections[index] : undefined

      if (target) {
        event.preventDefault()
        setSection(target.id)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [paletteOpen, settings.onboardingCompleted])

  if (!settingsReady) {
    return (
      <div className="onboarding-shell flex min-h-screen items-center justify-center bg-bc-bg text-bc-muted">
        <p className="text-sm">Loading Base Case…</p>
      </div>
    )
  }

  if (!settings.onboardingCompleted) {
    return <OnboardingView onFinish={finishOnboarding} />
  }

  const renderContent = (): JSX.Element => {
    if (loading) {
      return (
        <div className="empty-state">
          <h2>Loading workspace…</h2>
          <p>Reading the bundled content pack and local database.</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="callout callout-error">
          <strong>Could not start the workspace.</strong>
          <p>{error}</p>
          <p className="muted">
            Check that the bundled content pack is valid and that the app is running through
            Electron, not a plain browser.
          </p>
        </div>
      )
    }

    switch (section) {
      case 'coding':
        return (
          <CodingView
            problems={problems}
            selectedProblemId={selectedProblemId}
            reviewCardId={reviewCardId}
            onOpenProblem={openProblem}
            onBack={closeProblem}
            onReviewFinished={finishReview}
          />
        )
      case 'design':
        return <DesignView />
      case 'settings':
        return <SettingsView />
      case 'today':
        return <TodayView problems={problems} onOpenProblem={openProblem} onNavigate={setSection} />
      case 'progress':
        return <ProgressView onOpenProblem={openProblem} />
      case 'review':
        return <ReviewView onStartReview={startReview} />
      default:
        return <div />
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            BC
          </span>
          <div>
            <p className="brand-name">Base Case</p>
            <p className="brand-subtitle">Practice with intent</p>
          </div>
        </div>

        <nav className="nav" aria-label="Primary">
          {sections.map((item) => (
            <button
              key={item.id}
              type="button"
              className="nav-item"
              aria-current={item.id === section ? 'page' : undefined}
              onClick={() => setSection(item.id)}
            >
              <span className="nav-dot" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-line">
            <span className="status-dot" aria-hidden="true" />
            <span>Local mode</span>
          </div>
          <p>No account. No telemetry. Works offline.</p>
          <p className="version">{api ? `Electron ${api.versions.electron}` : 'Browser preview'}</p>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>{active.title}</h1>
          </div>
          <div className="topbar-actions">
            <Badge tone="success">Offline-first</Badge>
            <Tooltip
              content={`Open the command palette (${shortcutLabel(shortcuts.commandPalette)})`}
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPaletteOpen(true)}
                aria-haspopup="dialog"
              >
                {shortcutLabel(shortcuts.commandPalette)} commands
              </Button>
            </Tooltip>
          </div>
        </header>

        <main className="content" aria-labelledby="workspace-title">
          <p className="lede" id="workspace-title">
            {active.description}
          </p>
          <Suspense
            fallback={
              <div className="empty-state">
                <h2>Loading workspace…</h2>
                <p>Preparing the editor and local data.</p>
              </div>
            }
          >
            {renderContent()}
          </Suspense>
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        commands={commands}
        onClose={() => setPaletteOpen(false)}
      />
    </div>
  )
}

export default App
