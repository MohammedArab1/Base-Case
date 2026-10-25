import { useCallback, useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import { Excalidraw, exportToBlob, serializeAsJSON } from '@excalidraw/excalidraw'
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types'
import '@excalidraw/excalidraw/index.css'
import { designNoteSections, emptyDesignNotes } from '../../../shared/types'
import type {
  DesignAttemptSummary,
  DesignNotes,
  DesignRubricAnswers,
  DesignScenarioDetail,
  DesignScenarioSummary,
} from '../../../shared/types'
import { AiPanel } from '../components/AiPanel'
import { Markdown } from '../components/Markdown'
import { useSettings } from '../settings'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs'

type ExportOptions = Parameters<typeof exportToBlob>[0]

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the PNG blob.'))
    reader.readAsDataURL(blob)
  })
}

function parseScene(sceneJson: string): ExcalidrawInitialDataState | undefined {
  if (!sceneJson) {
    return undefined
  }

  try {
    return JSON.parse(sceneJson) as ExcalidrawInitialDataState
  } catch {
    return undefined
  }
}

function difficultyClass(difficulty: DesignScenarioSummary['difficulty']): string {
  return `difficulty difficulty-${difficulty}`
}

function formatScale(scale: DesignScenarioDetail['scale']): string {
  const format = (value: number): string =>
    new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)

  return `${format(scale.writesPerDay)} writes/day · ${format(scale.readsPerDay)} reads/day · ${scale.retentionYears}-year retention`
}

export function DesignView(): JSX.Element {
  const [scenarios, setScenarios] = useState<readonly DesignScenarioSummary[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void window.baseCase.design
      .listScenarios()
      .then((nextScenarios) => {
        if (!cancelled) {
          setScenarios(nextScenarios)
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
  }, [])

  if (selectedId) {
    return (
      <DesignWorkspace
        key={selectedId}
        scenarioId={selectedId}
        onBack={() => setSelectedId(null)}
      />
    )
  }

  return (
    <div className="workspace-stack">
      <div className="list-toolbar">
        <div>
          <h2>Design scenarios</h2>
          <p className="muted">
            {scenarios.length} {scenarios.length === 1 ? 'scenario' : 'scenarios'} · canvas, notes,
            rubric, and reference
          </p>
        </div>
      </div>

      {error ? (
        <div className="callout callout-error">
          <strong>Could not load design scenarios.</strong>
          <p>{error}</p>
        </div>
      ) : null}

      {loading ? (
        <p className="muted">Loading scenarios…</p>
      ) : scenarios.length === 0 ? (
        <section className="empty-state">
          <h2>No design scenarios yet</h2>
          <p>Install a content pack with design scenarios to start practicing.</p>
        </section>
      ) : (
        <div className="problem-list">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              className="problem-row"
              onClick={() => setSelectedId(scenario.id)}
              data-testid="design-scenario"
            >
              <span className="problem-main">
                <span className="problem-title">{scenario.title}</span>
                <span className="problem-meta">
                  {scenario.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                  <span className="tag tag-pack">{scenario.packName}</span>
                </span>
              </span>
              <span className={difficultyClass(scenario.difficulty)}>{scenario.difficulty}</span>
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

function DesignWorkspace({
  scenarioId,
  onBack,
}: {
  readonly scenarioId: string
  readonly onBack: () => void
}): JSX.Element {
  const [scenario, setScenario] = useState<DesignScenarioDetail | null>(null)
  const { settings } = useSettings()
  const resolvedTheme: 'light' | 'dark' =
    settings.theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : settings.theme
  const [initialScene, setInitialScene] = useState<ExcalidrawInitialDataState | undefined>()
  const [notes, setNotes] = useState<DesignNotes>({ ...emptyDesignNotes })
  const [rubric, setRubric] = useState<DesignRubricAnswers>({})
  const [attempts, setAttempts] = useState<readonly DesignAttemptSummary[]>([])
  const [tab, setTab] = useState('prompt')
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)
  const [exportState, setExportState] = useState<string | null>(null)

  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null)
  const sceneJsonRef = useRef('')
  const notesRef = useRef<DesignNotes>({ ...emptyDesignNotes })
  const rubricRef = useRef<DesignRubricAnswers>({})
  const draftLoadedRef = useRef(false)
  const dirtyRef = useRef(false)
  const saveTimer = useRef<number | null>(null)
  const lastInput = useRef<{ elements: unknown; files: unknown } | null>(null)

  useEffect(() => {
    let cancelled = false

    void Promise.all([
      window.baseCase.design.getScenario(scenarioId),
      window.baseCase.design.getDraft(scenarioId),
      window.baseCase.design.listAttempts(scenarioId),
    ])
      .then(([nextScenario, draft, nextAttempts]) => {
        if (cancelled) {
          return
        }

        setScenario(nextScenario)
        setInitialScene(parseScene(draft.sceneJson))
        sceneJsonRef.current = draft.sceneJson
        setNotes(draft.notes)
        notesRef.current = draft.notes
        setRubric(draft.rubric)
        rubricRef.current = draft.rubric
        setAttempts(nextAttempts)
        setTab(nextAttempts.length > 0 ? 'reference' : 'prompt')
        draftLoadedRef.current = true
        setDraftLoaded(true)
      })
      .catch((loadErrorValue: unknown) => {
        if (!cancelled) {
          setLoadError(
            loadErrorValue instanceof Error ? loadErrorValue.message : String(loadErrorValue),
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [scenarioId])

  const persistDraft = useCallback(async (): Promise<void> => {
    if (!draftLoadedRef.current) {
      return
    }

    setSaveState('saving')

    try {
      await window.baseCase.design.saveDraft({
        scenarioId,
        sceneJson: sceneJsonRef.current,
        notes: notesRef.current,
        rubric: rubricRef.current,
      })
      dirtyRef.current = false
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }, [scenarioId])

  const scheduleSave = useCallback((): void => {
    if (!draftLoadedRef.current) {
      return
    }

    dirtyRef.current = true
    setSaveState('saving')

    if (saveTimer.current !== null) {
      window.clearTimeout(saveTimer.current)
    }

    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = null
      void persistDraft()
    }, 800)
  }, [persistDraft])

  useEffect(() => {
    return () => {
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current)
        saveTimer.current = null
      }

      if (dirtyRef.current && draftLoadedRef.current) {
        dirtyRef.current = false
        void window.baseCase.design.saveDraft({
          scenarioId,
          sceneJson: sceneJsonRef.current,
          notes: notesRef.current,
          rubric: rubricRef.current,
        })
      }
    }
  }, [scenarioId])

  const changeNote = (section: keyof DesignNotes, value: string): void => {
    const next = { ...notesRef.current, [section]: value }
    notesRef.current = next
    setNotes(next)
    scheduleSave()
  }

  const setScore = (dimensionId: string, score: number): void => {
    const current = rubricRef.current[dimensionId] ?? { score: 0, evidence: '' }
    const next = {
      ...rubricRef.current,
      [dimensionId]: { ...current, score },
    }
    rubricRef.current = next
    setRubric(next)
    scheduleSave()
  }

  const setEvidence = (dimensionId: string, evidence: string): void => {
    const current = rubricRef.current[dimensionId] ?? { score: 0, evidence: '' }
    const next = {
      ...rubricRef.current,
      [dimensionId]: { ...current, evidence },
    }
    rubricRef.current = next
    setRubric(next)
    scheduleSave()
  }

  const submit = async (): Promise<void> => {
    if (!scenario) {
      return
    }

    const missing = scenario.rubric.filter((dimension) => {
      const answer = rubricRef.current[dimension.id]
      return !answer || answer.score < 1 || answer.evidence.trim().length < 10
    })

    if (missing.length > 0) {
      setSubmitError(
        `Score each dimension and add at least a sentence of evidence. Missing: ${missing
          .map((dimension) => dimension.name)
          .join(', ')}.`,
      )
      setTab('rubric')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current)
        saveTimer.current = null
      }

      await window.baseCase.design.saveDraft({
        scenarioId,
        sceneJson: sceneJsonRef.current,
        notes: notesRef.current,
        rubric: rubricRef.current,
      })

      const attempt = await window.baseCase.design.submit({
        scenarioId,
        sceneJson: sceneJsonRef.current,
        notes: notesRef.current,
        rubric: rubricRef.current,
      })

      dirtyRef.current = false
      setSaveState('saved')
      setAttempts((current) => [attempt, ...current])
      setTab('reference')
    } catch (submitFailure: unknown) {
      setSubmitError(submitFailure instanceof Error ? submitFailure.message : String(submitFailure))
    } finally {
      setSubmitting(false)
    }
  }

  const exportAttempt = async (attemptId: string): Promise<void> => {
    setExporting(attemptId)
    setExportState(null)

    try {
      const attempt = await window.baseCase.design.getAttempt(attemptId)
      let pngDataUrl: string | undefined

      try {
        const scene = JSON.parse(attempt.sceneJson) as {
          elements?: ExportOptions['elements']
          appState?: ExportOptions['appState']
          files?: ExportOptions['files']
        }

        if (Array.isArray(scene.elements) && scene.elements.length > 0) {
          const blob = await exportToBlob({
            elements: scene.elements,
            appState: scene.appState ?? {},
            files: scene.files ?? {},
            mimeType: 'image/png',
          })
          pngDataUrl = await blobToDataUrl(blob)
        }
      } catch {
        // A malformed scene should not block the Markdown export.
      }

      const result = await window.baseCase.design.exportAttempt({ attemptId, pngDataUrl })
      setExportState(
        result.saved
          ? `Exported ${result.path ?? 'the attempt'}${result.pngPath ? ' with a PNG' : ''}.`
          : 'Export cancelled.',
      )
    } catch (exportError: unknown) {
      setExportState(exportError instanceof Error ? exportError.message : String(exportError))
    } finally {
      setExporting(null)
    }
  }

  if (loadError) {
    return (
      <div className="workspace-stack">
        <button type="button" className="text-button" onClick={onBack}>
          ← Back to scenarios
        </button>
        <div className="callout callout-error">
          <strong>Could not load the scenario.</strong>
          <p>{loadError}</p>
        </div>
      </div>
    )
  }

  if (!scenario || !draftLoaded) {
    return (
      <div className="workspace-stack">
        <p className="muted">Loading scenario…</p>
      </div>
    )
  }

  const saveLabel =
    saveState === 'saving'
      ? 'Saving…'
      : saveState === 'saved'
        ? 'Saved locally'
        : saveState === 'error'
          ? 'Save failed'
          : 'Autosave on'
  const referenceUnlocked = attempts.length > 0
  const scored = scenario.rubric
    .map((dimension) => rubric[dimension.id]?.score ?? 0)
    .filter((score) => score >= 1)
  const averageScore =
    scored.length === 0
      ? null
      : Math.round((scored.reduce((sum, score) => sum + score, 0) / scored.length) * 10) / 10

  return (
    <div className="workspace-stack design-workspace">
      <div className="workspace-heading">
        <div className="workspace-heading-top">
          <button type="button" className="text-button" onClick={onBack}>
            ← Back to scenarios
          </button>
          <div className="toolbar-actions">
            <span className="muted save-indicator">{saveLabel}</span>
            <Button
              variant="primary"
              onClick={() => void submit()}
              disabled={submitting}
              data-testid="submit-design"
            >
              {submitting ? 'Submitting…' : 'Submit design'}
            </Button>
          </div>
        </div>
        <div>
          <h2>{scenario.title}</h2>
          <p className="muted">
            <span className={difficultyClass(scenario.difficulty)}>{scenario.difficulty}</span>
            {' · '}
            {scenario.tags.join(', ')}
          </p>
        </div>
      </div>

      {submitError ? (
        <div className="callout callout-error" data-testid="design-submit-error">
          <p>{submitError}</p>
        </div>
      ) : null}

      {exportState ? (
        <p className="muted" data-testid="design-export-status">
          {exportState}
        </p>
      ) : null}

      <div className="design-grid">
        <section className="pane canvas-pane">
          <div className="pane-header">
            <span>Canvas</span>
            <span className="muted">Excalidraw · autosaves locally</span>
          </div>
          <div className="canvas-wrap design-canvas">
            <Excalidraw
              excalidrawAPI={(api) => {
                apiRef.current = api
              }}
              theme={resolvedTheme}
              initialData={initialScene}
              onChange={(elements, appState, files) => {
                if (!draftLoadedRef.current) {
                  return
                }

                const contentChanged =
                  lastInput.current === null ||
                  elements !== lastInput.current.elements ||
                  files !== lastInput.current.files
                lastInput.current = { elements, files }

                if (!contentChanged) {
                  return
                }

                sceneJsonRef.current = serializeAsJSON(elements, appState, files, 'local')
                scheduleSave()
              }}
            />
          </div>
        </section>

        <aside className="pane design-side" aria-label="Design workspace">
          <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
            <TabsList className="mx-3 mt-3 flex-wrap justify-start self-start">
              <TabsTrigger value="prompt">Prompt</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="ai">AI review</TabsTrigger>
              <TabsTrigger value="rubric">Rubric</TabsTrigger>
              <TabsTrigger value="reference">Reference</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <div className="inspector-scroll">
              <TabsContent value="prompt" className="pt-0">
                <div className="p-3">
                  <Markdown>{scenario.prompt}</Markdown>
                  <section className="design-requirements">
                    <h3>Functional</h3>
                    <ul>
                      {scenario.requirements.functional.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <h3>Non-functional</h3>
                    <ul>
                      {scenario.requirements.nonFunctional.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <h3>Scale</h3>
                    <p className="muted">{formatScale(scenario.scale)}</p>
                  </section>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="pt-0">
                <div className="design-notes" data-testid="design-notes">
                  {designNoteSections.map((section) => (
                    <label key={section.id} className="design-note-field">
                      <span>{section.label}</span>
                      <textarea
                        className="design-note-input"
                        aria-label={section.label}
                        value={notes[section.id]}
                        placeholder={section.placeholder}
                        rows={4}
                        onChange={(event) => changeNote(section.id, event.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="ai" className="pt-0">
                <AiPanel variant="design" design={{ scenarioId, notes, rubric }} />
              </TabsContent>

              <TabsContent value="rubric" className="pt-0">
                <div className="design-rubric" data-testid="design-rubric">
                  {scenario.rubric.map((dimension) => {
                    const answer = rubric[dimension.id]
                    const score = answer?.score ?? 0

                    return (
                      <section
                        key={dimension.id}
                        className="rubric-dimension"
                        data-testid={`rubric-${dimension.id}`}
                      >
                        <h3>{dimension.name}</h3>
                        <p className="muted">{dimension.description}</p>
                        <div
                          className="rubric-scores"
                          role="group"
                          aria-label={`${dimension.name} score`}
                        >
                          {[1, 2, 3, 4].map((value) => (
                            <button
                              key={value}
                              type="button"
                              aria-pressed={score === value}
                              onClick={() => setScore(dimension.id, value)}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                        {score >= 1 ? (
                          <p className="rubric-descriptor">
                            {
                              dimension.levels[
                                String(
                                  score,
                                ) as keyof DesignScenarioDetail['rubric'][number]['levels']
                              ]
                            }
                          </p>
                        ) : null}
                        <textarea
                          className="design-note-input"
                          aria-label={`${dimension.name} evidence`}
                          value={answer?.evidence ?? ''}
                          placeholder="What did you cover? Point to your notes or canvas."
                          rows={3}
                          onChange={(event) => setEvidence(dimension.id, event.target.value)}
                        />
                      </section>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="reference" className="pt-0">
                <div className="p-3">
                  {referenceUnlocked ? (
                    <>
                      <section className="design-checklist">
                        <h3>Expected topics</h3>
                        <ul>
                          {scenario.checklist.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </section>
                      <section className="design-score-summary" data-testid="design-score-summary">
                        <h3>Your self-assessment</h3>
                        <ul>
                          {scenario.rubric.map((dimension) => (
                            <li key={dimension.id}>
                              <span>{dimension.name}</span>
                              <span>{rubric[dimension.id]?.score ?? '—'} / 4</span>
                            </li>
                          ))}
                        </ul>
                        <p className="muted">Average: {averageScore ?? '—'} / 4</p>
                      </section>
                      <Markdown>{scenario.reference.markdown}</Markdown>
                      {scenario.followUps.length > 0 ? (
                        <section className="statement-details">
                          <h3>Follow-ups</h3>
                          <ul>
                            {scenario.followUps.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </section>
                      ) : null}
                      {scenario.commonMistakes.length > 0 ? (
                        <section className="statement-details">
                          <h3>Common mistakes</h3>
                          <ul>
                            {scenario.commonMistakes.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </section>
                      ) : null}
                    </>
                  ) : (
                    <div className="empty-state design-locked">
                      <h2>Reference is locked</h2>
                      <p>
                        Complete the notes and rubric, then submit to reveal the reference design
                        and the expected-topics checklist.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="pt-0">
                <div className="p-3">
                  {attempts.length === 0 ? (
                    <p className="muted">
                      No submissions yet. Your first submission creates a design review card.
                    </p>
                  ) : (
                    <ul className="attempt-list" data-testid="design-attempts">
                      {attempts.map((attempt) => (
                        <li key={attempt.id} className="attempt-list-row">
                          <span className="muted">
                            {new Date(attempt.createdAt).toLocaleString()}
                          </span>
                          <Badge tone={attempt.averageScore ? 'success' : 'neutral'}>
                            {attempt.averageScore ?? '—'} / 4
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void exportAttempt(attempt.id)}
                            disabled={exporting !== null}
                            data-testid="export-design-attempt"
                          >
                            {exporting === attempt.id ? 'Exporting…' : 'Export'}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </aside>
      </div>
    </div>
  )
}
