import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import type { JSX } from 'react'
import type { ProblemSummary, SectionId, Stats } from '../../shared/types'
import { CommandPalette } from './components/CommandPalette'
import type { Command } from './components/CommandPalette'
import { matchesShortcut, shortcutLabel, shortcuts } from './lib/shortcuts'
import { useSettings } from './settings'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Tooltip } from './ui/Tooltip'

const CodingView = lazy(() =>
  import('./views/CodingView').then((module) => ({ default: module.CodingView })),
)
const DesignView = lazy(() =>
  import('./views/DesignView').then((module) => ({ default: module.DesignView })),
)
const SettingsView = lazy(() =>
  import('./views/SettingsView').then((module) => ({ default: module.SettingsView })),
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
  const { settings, update } = useSettings()
  const [section, setSection] = useState<SectionId>('today')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [problems, setProblems] = useState<readonly ProblemSummary[]>([])
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const active = sections.find((item) => item.id === section) ?? sections[0]!
  const api = typeof window !== 'undefined' && 'baseCase' in window ? window.baseCase : undefined

  const refreshStats = useCallback((): void => {
    if (!api) {
      return
    }

    void api.attempts
      .stats()
      .then(setStats)
      .catch((statsError: unknown) => {
        setError(statsError instanceof Error ? statsError.message : String(statsError))
      })
  }, [api])

  useEffect(() => {
    if (!api) {
      setError('The desktop bridge is unavailable. Open this window through Electron.')
      setLoading(false)
      return
    }

    let cancelled = false

    void Promise.all([api.content.list(), api.attempts.stats()])
      .then(([nextProblems, nextStats]) => {
        if (!cancelled) {
          setProblems(nextProblems)
          setStats(nextStats)
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

  const openProblem = (problemId: string): void => {
    setSelectedProblemId(problemId)
    setSection('coding')
  }

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
  }, [paletteOpen])

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
            onOpenProblem={openProblem}
            onBack={() => setSelectedProblemId(null)}
            onStatsChanged={refreshStats}
          />
        )
      case 'design':
        return <DesignView />
      case 'settings':
        return <SettingsView />
      case 'today':
        return (
          <TodayView
            problems={problems}
            stats={stats}
            onOpenProblem={openProblem}
            onNavigate={setSection}
          />
        )
      case 'progress':
        return <ProgressView stats={stats} />
      case 'review':
        return (
          <div className="empty-state">
            <h2>Review is not wired up yet</h2>
            <p>
              FSRS scheduling arrives in Phase 4. The coding loop and attempt history are already
              stored locally.
            </p>
          </div>
        )
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

function TodayView({
  problems,
  stats,
  onOpenProblem,
  onNavigate,
}: {
  readonly problems: readonly ProblemSummary[]
  readonly stats: Stats | null
  readonly onOpenProblem: (problemId: string) => void
  readonly onNavigate: (section: SectionId) => void
}): JSX.Element {
  const firstProblem = problems[0]

  return (
    <div className="workspace-stack">
      <div className="card-grid">
        <section className="card">
          <h2>Review queue</h2>
          <p>No cards are due. FSRS scheduling arrives with the review module.</p>
          <button type="button" className="text-button" onClick={() => onNavigate('review')}>
            Open Review
          </button>
        </section>

        <section className="card">
          <h2>Continue</h2>
          <p>
            {firstProblem
              ? `Start with ${firstProblem.title} and run the sample tests.`
              : 'No problem is loaded yet.'}
          </p>
          <button
            type="button"
            className="text-button"
            disabled={!firstProblem}
            onClick={() => {
              if (firstProblem) {
                onOpenProblem(firstProblem.id)
              }
            }}
          >
            {firstProblem ? 'Open coding workspace' : 'No problems'}
          </button>
        </section>

        <section className="card">
          <h2>Practice so far</h2>
          <p>
            {stats
              ? `${stats.attempts} attempts · ${stats.accepted} accepted`
              : 'No attempts yet. Your first run starts the history.'}
          </p>
          <button type="button" className="text-button" onClick={() => onNavigate('progress')}>
            View progress
          </button>
        </section>
      </div>

      <section className="empty-state">
        <div className="empty-illustration" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h2>Phase 1 end-to-end demo</h2>
        <p>
          Open the coding workspace, run Python or TypeScript against the sample tests, submit
          against the hidden tests, reveal a hint, and ask the optional AI tutor about a failure.
        </p>
        <p className="hint">
          The system design canvas saves locally and exports to PNG. AI is disabled until you
          configure a provider in Settings.
        </p>
      </section>
    </div>
  )
}

function ProgressView({ stats }: { readonly stats: Stats | null }): JSX.Element {
  return (
    <div className="workspace-stack">
      <div className="card-grid">
        <section className="card">
          <h2>Attempts</h2>
          <p className="metric">{stats?.attempts ?? 0}</p>
          <p>Sample runs and submissions stored in SQLite.</p>
        </section>
        <section className="card">
          <h2>Accepted</h2>
          <p className="metric">{stats?.accepted ?? 0}</p>
          <p>Submissions that passed every test.</p>
        </section>
        <section className="card">
          <h2>Last attempt</h2>
          <p className="metric metric-small">
            {stats?.lastAttemptAt ? new Date(stats.lastAttemptAt).toLocaleString() : '—'}
          </p>
          <p>All timestamps are local ISO-8601 values.</p>
        </section>
      </div>

      <section className="empty-state">
        <h2>Pattern mastery is coming next</h2>
        <p>
          Attempts and mistake tags are stored now. Charts, pattern weighting, review adherence, and
          CSV/JSON export arrive with the FSRS module.
        </p>
      </section>
    </div>
  )
}

export default App
