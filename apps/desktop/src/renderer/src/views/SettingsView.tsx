import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import type {
  AiFeatureSettings,
  AiProviderStatus,
  AiProviderType,
  AiTestConnectionResult,
  AppInfo,
  ContentPackSummary,
  DiagnosticsReport,
  JudgeStatus,
  PackImportKind,
  PackPreviewResult,
  SaveAiConfigInput,
  SettingsPatch,
  ThemePreference,
} from '../../../shared/types'
import { formatDiagnosticsReport } from '../../../shared/diagnostics'
import { useSettings } from '../settings'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '../ui/Dialog'
import { Toast } from '../ui/Toast'

interface AiForm {
  readonly type: AiProviderType
  readonly baseUrl: string
  readonly model: string
  readonly contextWindow: number
  readonly apiKey: string
}

const defaultBaseUrl = 'https://api.openai.com/v1'
const defaultModel = 'gpt-4o-mini'
const defaultContextWindow = 32768

const aiFeatureOptions: readonly {
  readonly id: keyof AiFeatureSettings
  readonly label: string
}[] = [
  { id: 'explain', label: 'Explain failure' },
  { id: 'hint', label: 'Hints' },
  { id: 'approach', label: 'Approach review' },
  { id: 'complexity', label: 'Complexity review' },
  { id: 'mistakeTags', label: 'Mistake tag suggestions' },
  { id: 'explainBack', label: 'Explain-back check' },
  { id: 'designNotes', label: 'Design notes review' },
  { id: 'followUp', label: 'Follow-up interviewer' },
]

interface SettingsToast {
  readonly title: string
  readonly description?: string
  readonly tone?: 'neutral' | 'danger'
}

function breakablePath(path: string): JSX.Element {
  return (
    <>
      {path.split(/([\\/])/).map((part, index) => (
        <span key={`${part}-${index}`}>
          {part}
          {/^[\\/]$/.test(part) ? <wbr /> : null}
        </span>
      ))}
    </>
  )
}

export function SettingsView(): JSX.Element {
  const { settings, update } = useSettings()
  const [provider, setProvider] = useState<AiProviderStatus | null>(null)
  const [judgeStatus, setJudgeStatus] = useState<JudgeStatus | null>(null)
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [form, setForm] = useState<AiForm>({
    type: 'none',
    baseUrl: defaultBaseUrl,
    model: defaultModel,
    contextWindow: defaultContextWindow,
    apiKey: '',
  })
  const [clearKey, setClearKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<AiTestConnectionResult | null>(null)
  const [loadingJudge, setLoadingJudge] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)
  const [toast, setToast] = useState<SettingsToast | null>(null)
  const [packs, setPacks] = useState<readonly ContentPackSummary[]>([])
  const [importResult, setImportResult] = useState<PackPreviewResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<ContentPackSummary | null>(null)
  const [removing, setRemoving] = useState(false)
  const [transferring, setTransferring] = useState<'export' | 'import' | null>(null)
  const [transferStatus, setTransferStatus] = useState<string | null>(null)
  const [diagnostics, setDiagnostics] = useState<DiagnosticsReport | null>(null)
  const [runningDiagnostics, setRunningDiagnostics] = useState(false)
  const [diagnosticsCopied, setDiagnosticsCopied] = useState(false)

  useEffect(() => {
    let cancelled = false

    void Promise.all([
      window.baseCase.ai.getStatus(),
      window.baseCase.judge.status(),
      window.baseCase.app.getInfo(),
      window.baseCase.packs.list(),
    ])
      .then(([aiStatus, nextJudgeStatus, info, nextPacks]) => {
        if (cancelled) {
          return
        }

        setProvider(aiStatus)
        setJudgeStatus(nextJudgeStatus)
        setAppInfo(info)
        setPacks(nextPacks)
        setForm({
          type: aiStatus.type,
          baseUrl: aiStatus.baseUrl || defaultBaseUrl,
          model: aiStatus.model || defaultModel,
          contextWindow: aiStatus.contextWindow || defaultContextWindow,
          apiKey: '',
        })
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : String(loadError))
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const changeSettings = async (patch: SettingsPatch): Promise<void> => {
    setSavingSettings(true)

    try {
      await update(patch)
      setToast({ title: 'Settings saved' })
    } catch (settingsError: unknown) {
      setToast({
        title: 'Could not save settings',
        description: settingsError instanceof Error ? settingsError.message : String(settingsError),
        tone: 'danger',
      })
    } finally {
      setSavingSettings(false)
    }
  }

  const exportData = async (): Promise<void> => {
    setTransferring('export')
    setTransferStatus(null)

    try {
      const result = await window.baseCase.data.export()

      if (!result.saved) {
        setTransferStatus('Export cancelled.')
        return
      }

      const rows = Object.values(result.counts ?? {}).reduce((sum, count) => sum + count, 0)
      setTransferStatus(`Exported ${rows} rows.`)
    } catch (transferError: unknown) {
      setTransferStatus(
        transferError instanceof Error ? transferError.message : String(transferError),
      )
    } finally {
      setTransferring(null)
    }
  }

  const importData = async (): Promise<void> => {
    setTransferring('import')
    setTransferStatus(null)

    try {
      const result = await window.baseCase.data.import()

      if (!result.saved) {
        setTransferStatus('Import cancelled.')
        return
      }

      const rows = Object.values(result.counts ?? {}).reduce((sum, count) => sum + count, 0)
      setTransferStatus(`Imported ${rows} rows. Reloading…`)
      window.setTimeout(() => window.location.reload(), 400)
    } catch (transferError: unknown) {
      setTransferStatus(
        transferError instanceof Error ? transferError.message : String(transferError),
      )
    } finally {
      setTransferring(null)
    }
  }

  const refreshJudge = async (): Promise<void> => {
    setLoadingJudge(true)
    setError(null)

    try {
      setJudgeStatus(await window.baseCase.judge.status())
    } catch (judgeError: unknown) {
      setError(judgeError instanceof Error ? judgeError.message : String(judgeError))
    } finally {
      setLoadingJudge(false)
    }
  }

  const runSelfTest = async (): Promise<void> => {
    setRunningDiagnostics(true)
    setError(null)

    try {
      setDiagnostics(await window.baseCase.app.diagnostics())
    } catch (diagnosticError: unknown) {
      setError(diagnosticError instanceof Error ? diagnosticError.message : String(diagnosticError))
    } finally {
      setRunningDiagnostics(false)
    }
  }

  const copyDiagnostics = async (): Promise<void> => {
    if (!diagnostics) {
      return
    }

    try {
      await navigator.clipboard.writeText(formatDiagnosticsReport(diagnostics))
      setDiagnosticsCopied(true)
      window.setTimeout(() => setDiagnosticsCopied(false), 1500)
    } catch {
      setError('Could not copy the diagnostics report to the clipboard.')
    }
  }

  const buildInput = (): SaveAiConfigInput => ({
    type: form.type,
    baseUrl: form.baseUrl,
    model: form.model,
    contextWindow: form.contextWindow,
    ...(form.apiKey.trim() ? { apiKey: form.apiKey.trim() } : {}),
    ...(clearKey ? { clearKey: true } : {}),
  })

  const save = async (): Promise<void> => {
    setSaving(true)

    try {
      const nextProvider = await window.baseCase.ai.saveConfig(buildInput())
      setProvider(nextProvider)
      setForm((current) => ({ ...current, apiKey: '' }))
      setClearKey(false)
      setToast({
        title: nextProvider.enabled
          ? 'AI provider saved.'
          : 'AI provider saved, but it is not enabled.',
      })
    } catch (saveError: unknown) {
      setToast({
        title: 'Could not save the AI provider',
        description: saveError instanceof Error ? saveError.message : String(saveError),
        tone: 'danger',
      })
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async (): Promise<void> => {
    setTesting(true)
    setTestResult(null)

    try {
      const nextProvider = await window.baseCase.ai.saveConfig(buildInput())
      setProvider(nextProvider)
      setForm((current) => ({ ...current, apiKey: '' }))
      setClearKey(false)
      setTestResult(await window.baseCase.ai.testConnection())
    } catch (testError: unknown) {
      setTestResult({
        ok: false,
        message: testError instanceof Error ? testError.message : String(testError),
        latencyMs: 0,
        model: form.model,
      })
    } finally {
      setTesting(false)
    }
  }

  const toggleFeature = (feature: keyof AiFeatureSettings, value: boolean): void => {
    void changeSettings({ aiFeatures: { [feature]: value } })
  }

  const isCompatible = form.type === 'openai-compatible'
  const pendingPreview = importResult?.ok ? importResult.preview : undefined
  const importIssues = importResult && !importResult.ok ? (importResult.issues ?? []) : []

  const loadPacks = async (): Promise<void> => {
    setPacks(await window.baseCase.packs.list())
  }

  const startImport = async (kind: PackImportKind): Promise<void> => {
    setImporting(true)
    setError(null)

    try {
      const result = await window.baseCase.packs.preview(kind)

      if (result) {
        setImportResult(result)
      }
    } catch (importError: unknown) {
      setToast({
        title: 'Could not open the pack',
        description: importError instanceof Error ? importError.message : String(importError),
        tone: 'danger',
      })
    } finally {
      setImporting(false)
    }
  }

  const confirmInstall = async (): Promise<void> => {
    if (!pendingPreview) {
      return
    }

    setInstalling(true)

    try {
      const installed = await window.baseCase.packs.install(pendingPreview.token)
      await loadPacks()
      setImportResult(null)
      window.dispatchEvent(new Event('base-case:content-changed'))
      setToast({
        title: `${installed.name} installed`,
        description: `${installed.problemCount} ${
          installed.problemCount === 1 ? 'problem' : 'problems'
        } added to your library.`,
      })
    } catch (installError: unknown) {
      setToast({
        title: 'Could not install the pack',
        description: installError instanceof Error ? installError.message : String(installError),
        tone: 'danger',
      })
    } finally {
      setInstalling(false)
    }
  }

  const confirmRemove = async (): Promise<void> => {
    if (!removeTarget) {
      return
    }

    setRemoving(true)

    try {
      await window.baseCase.packs.uninstall(removeTarget.id)
      await loadPacks()
      setRemoveTarget(null)
      window.dispatchEvent(new Event('base-case:content-changed'))
      setToast({
        title: `${removeTarget.name} removed`,
        description: 'Attempts and drafts are kept.',
      })
    } catch (removeError: unknown) {
      setToast({
        title: 'Could not remove the pack',
        description: removeError instanceof Error ? removeError.message : String(removeError),
        tone: 'danger',
      })
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="settings-stack">
      <Toast
        open={toast !== null}
        onOpenChange={(open) => {
          if (!open) {
            setToast(null)
          }
        }}
        title={toast?.title ?? ''}
        description={toast?.description}
        tone={toast?.tone}
      />

      <Dialog
        open={importResult !== null}
        onOpenChange={(open) => {
          if (!open && !installing) {
            setImportResult(null)
          }
        }}
      >
        <DialogContent className="p-5" data-testid="pack-import-dialog">
          {importResult?.ok ? (
            <>
              <DialogTitle>Import “{pendingPreview?.name}”?</DialogTitle>
              <DialogDescription>
                Review this pack before adding it to your library.
              </DialogDescription>

              <dl className="mt-4 grid grid-cols-[110px_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="m-0 text-bc-muted">Id</dt>
                <dd className="m-0 font-mono text-xs text-bc-text">{pendingPreview?.id}</dd>
                <dt className="m-0 text-bc-muted">Version</dt>
                <dd className="m-0 text-bc-text">{pendingPreview?.version}</dd>
                <dt className="m-0 text-bc-muted">Contents</dt>
                <dd className="m-0 text-bc-text">
                  {pendingPreview?.problemCount ?? 0}{' '}
                  {pendingPreview?.problemCount === 1 ? 'problem' : 'problems'} ·{' '}
                  {pendingPreview?.designCount ?? 0}{' '}
                  {pendingPreview?.designCount === 1 ? 'design' : 'designs'}
                </dd>
                <dt className="m-0 text-bc-muted">License</dt>
                <dd className="m-0 text-bc-text">{pendingPreview?.license}</dd>
                <dt className="m-0 text-bc-muted">Attribution</dt>
                <dd className="m-0 text-bc-text">{pendingPreview?.attribution}</dd>
              </dl>

              {pendingPreview && pendingPreview.warnings.length > 0 ? (
                <div className="mt-4 rounded-lg border border-bc-border bg-bc-surface-muted p-3">
                  <p className="m-0 text-xs font-semibold text-bc-text">
                    Warnings ({pendingPreview.warnings.length})
                  </p>
                  <ul className="mb-0 mt-1 list-disc space-y-1 pl-4 text-xs text-bc-muted">
                    {pendingPreview.warnings.slice(0, 6).map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                    {pendingPreview.warnings.length > 6 ? (
                      <li>{pendingPreview.warnings.length - 6} more</li>
                    ) : null}
                  </ul>
                </div>
              ) : null}

              <p className="mb-0 mt-4 text-xs text-bc-muted">
                You are responsible for content you import. Packs are plain data; Base Case checks
                their structure but does not review their claims, solutions, or licensing.
              </p>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setImportResult(null)} disabled={installing}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => void confirmInstall()}
                  disabled={installing}
                  data-testid="pack-import-confirm"
                >
                  {installing ? 'Installing…' : 'Import pack'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogTitle>This pack could not be imported</DialogTitle>
              <DialogDescription>
                Nothing was installed. Fix these issues and try again.
              </DialogDescription>

              <ul className="mb-0 mt-4 max-h-72 list-disc space-y-2 overflow-auto pl-5 text-sm text-bc-text">
                {importIssues.slice(0, 8).map((issue, index) => (
                  <li key={`${issue.path}-${index}`}>
                    <code className="text-xs text-bc-muted">{issue.path}</code>
                    <span className="text-bc-text"> — {issue.message}</span>
                  </li>
                ))}
                {importIssues.length > 8 ? (
                  <li className="text-bc-muted">and {importIssues.length - 8} more…</li>
                ) : null}
              </ul>

              <DialogFooter>
                <Button variant="secondary" onClick={() => setImportResult(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open && !removing) {
            setRemoveTarget(null)
          }
        }}
      >
        <DialogContent className="p-5" data-testid="pack-remove-dialog">
          <DialogTitle>Remove “{removeTarget?.name}”?</DialogTitle>
          <DialogDescription>
            The pack's problems will disappear from the library and search. Your attempts, drafts,
            and review history are kept.
          </DialogDescription>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setRemoveTarget(null)} disabled={removing}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => void confirmRemove()}
              disabled={removing}
              data-testid="pack-remove-confirm"
            >
              {removing ? 'Removing…' : 'Remove pack'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error ? (
        <div className="callout callout-error" role="alert">
          <strong>Something went wrong.</strong>
          <p>{error}</p>
        </div>
      ) : null}

      <section className="settings-card">
        <div className="settings-card-heading">
          <div>
            <h2>Appearance and editor</h2>
            <p className="muted">Theme, preferred language, and editor defaults.</p>
          </div>
          {savingSettings ? <span className="muted">Saving…</span> : null}
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Theme</span>
            <select
              className="input"
              aria-label="Theme"
              value={settings.theme}
              onChange={(event) =>
                void changeSettings({ theme: event.target.value as ThemePreference })
              }
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>

          <label className="field">
            <span>Preferred language</span>
            <select
              className="input"
              aria-label="Preferred language"
              value={settings.language}
              onChange={(event) =>
                void changeSettings({
                  language: event.target.value === 'typescript' ? 'typescript' : 'python',
                })
              }
            >
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
            </select>
          </label>

          <label className="field">
            <span>Editor font size</span>
            <select
              className="input"
              aria-label="Editor font size"
              value={settings.editor.fontSize}
              onChange={(event) =>
                void changeSettings({ editor: { fontSize: Number(event.target.value) } })
              }
            >
              {[11, 12, 13, 14, 15, 16, 18, 20].map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Tab size</span>
            <select
              className="input"
              aria-label="Tab size"
              value={settings.editor.tabSize}
              onChange={(event) =>
                void changeSettings({ editor: { tabSize: Number(event.target.value) } })
              }
            >
              {[2, 4, 8].map((size) => (
                <option key={size} value={size}>
                  {size} spaces
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Daily goal</span>
            <select
              className="input"
              aria-label="Daily goal"
              value={settings.dailyGoalMinutes}
              onChange={(event) =>
                void changeSettings({ dailyGoalMinutes: Number(event.target.value) })
              }
            >
              {[15, 20, 30, 45, 60, 90, 120].map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} minutes
                </option>
              ))}
            </select>
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={settings.editor.wordWrap}
              onChange={(event) =>
                void changeSettings({ editor: { wordWrap: event.target.checked } })
              }
            />
            Wrap long lines
          </label>

          <label className="field">
            <span>Reviews per day</span>
            <select
              className="input"
              aria-label="Reviews per day"
              value={settings.reviewDailyLimit}
              onChange={(event) =>
                void changeSettings({ reviewDailyLimit: Number(event.target.value) })
              }
            >
              {[10, 20, 30, 50, 100].map((count) => (
                <option key={count} value={count}>
                  {count} reviews
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>New cards per day</span>
            <select
              className="input"
              aria-label="New cards per day"
              value={settings.newCardsPerDay}
              onChange={(event) =>
                void changeSettings({ newCardsPerDay: Number(event.target.value) })
              }
            >
              {[0, 5, 10, 15, 20, 30].map((count) => (
                <option key={count} value={count}>
                  {count} new cards
                </option>
              ))}
            </select>
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={settings.reviewReminders}
              onChange={(event) => void changeSettings({ reviewReminders: event.target.checked })}
            />
            Review reminders
          </label>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-heading">
          <div>
            <h2>Content packs</h2>
            <p className="muted">
              Problem sets stored locally. Imports are validated before installation, and removing a
              pack keeps your attempts and drafts.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void startImport('archive')}
              disabled={importing}
              data-testid="pack-import-archive"
            >
              {importing ? 'Opening…' : 'Import ZIP…'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void startImport('folder')}
              disabled={importing}
              data-testid="pack-import-folder"
            >
              Import folder…
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2" data-testid="pack-list">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-bc-border bg-bc-surface px-3 py-2.5"
              data-testid={`pack-row-${pack.id}`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm text-bc-text">{pack.name}</strong>
                  <Badge
                    tone={pack.source === 'bundled' ? 'neutral' : 'accent'}
                    title={
                      pack.source === 'bundled'
                        ? 'Included with Base Case'
                        : 'Imported packs are not reviewed by Base Case'
                    }
                  >
                    {pack.source === 'bundled' ? 'Bundled' : 'Unverified'}
                  </Badge>
                  <span className="text-xs text-bc-muted">v{pack.version}</span>
                </div>
                <p className="m-0 mt-1 text-xs text-bc-muted">
                  {pack.problemCount} {pack.problemCount === 1 ? 'problem' : 'problems'} ·{' '}
                  {pack.designCount} {pack.designCount === 1 ? 'design' : 'designs'} ·{' '}
                  {pack.license}
                </p>
                <p className="m-0 mt-0.5 text-xs text-bc-muted">{pack.attribution}</p>
              </div>

              {pack.source === 'user' ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 text-bc-danger"
                  onClick={() => setRemoveTarget(pack)}
                  data-testid={`pack-remove-${pack.id}`}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card-heading">
          <div>
            <h2>AI provider</h2>
            <p className="muted">
              Optional and experimental. Keys are encrypted with the OS keychain and never exposed
              to the renderer. Pre-authored hints remain the primary path.
            </p>
          </div>
          <span className={`badge ${provider?.enabled && settings.aiEnabled ? '' : 'badge-muted'}`}>
            {!settings.aiEnabled ? 'AI off' : provider?.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Provider</span>
            <select
              className="input"
              aria-label="AI provider"
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({ ...current, type: event.target.value as AiProviderType }))
              }
            >
              <option value="none">None</option>
              <option value="mock">Mock (no network)</option>
              <option value="openai-compatible">OpenAI-compatible</option>
            </select>
          </label>

          {isCompatible ? (
            <>
              <label className="field">
                <span>Base URL</span>
                <input
                  className="input"
                  type="url"
                  value={form.baseUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, baseUrl: event.target.value }))
                  }
                  placeholder={defaultBaseUrl}
                />
              </label>

              <label className="field">
                <span>Model</span>
                <input
                  className="input"
                  type="text"
                  value={form.model}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, model: event.target.value }))
                  }
                  placeholder={defaultModel}
                />
              </label>

              <label className="field field-wide">
                <span>API key</span>
                <input
                  className="input"
                  type="password"
                  autoComplete="off"
                  value={form.apiKey}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, apiKey: event.target.value }))
                  }
                  placeholder={
                    provider?.hasKey ? 'A key is stored; leave blank to keep it' : 'sk-…'
                  }
                />
              </label>

              <label className="field">
                <span>Context window (tokens)</span>
                <input
                  className="input"
                  type="number"
                  min={2048}
                  max={2000000}
                  step={1024}
                  aria-label="AI context window"
                  value={form.contextWindow}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      contextWindow: Number(event.target.value) || defaultContextWindow,
                    }))
                  }
                />
              </label>
            </>
          ) : null}
        </div>

        <div className="settings-actions">
          {provider?.hasKey ? (
            <label className="checkbox">
              <input
                type="checkbox"
                checked={clearKey}
                onChange={(event) => setClearKey(event.target.checked)}
              />
              Remove stored key
            </label>
          ) : (
            <span className="muted">No key stored.</span>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void testConnection()}
            disabled={testing || saving}
            data-testid="ai-test-connection"
          >
            {testing ? 'Testing…' : 'Test connection'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void save()}
            disabled={saving || testing}
          >
            {saving ? 'Saving…' : 'Save provider'}
          </button>
        </div>

        {testResult ? (
          <div
            className={`callout ${testResult.ok ? '' : 'callout-error'}`}
            data-testid="ai-test-result"
          >
            <strong>{testResult.ok ? 'Connection OK' : 'Connection failed'}</strong>
            <p>{testResult.message}</p>
          </div>
        ) : null}

        <div className="mt-4 border-t border-bc-border pt-3">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={settings.aiEnabled}
              onChange={(event) => void changeSettings({ aiEnabled: event.target.checked })}
              data-testid="ai-enabled"
            />
            Enable AI features
          </label>
          <p className="muted small">
            AI is off by default. The app works fully without it. Each feature can be turned off
            independently.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {aiFeatureOptions.map((option) => (
              <label className="checkbox" key={option.id}>
                <input
                  type="checkbox"
                  checked={settings.aiFeatures[option.id]}
                  onChange={(event) => toggleFeature(option.id, event.target.checked)}
                  disabled={!settings.aiEnabled}
                  data-testid={`ai-feature-${option.id}`}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <p className="muted small">
          The mock provider returns canned text. A real provider is called only after the context
          preview is confirmed. Local endpoints such as Ollama work without a key. With a cloud
          provider, the preview shows exactly what leaves your machine.
        </p>
      </section>

      <section className="settings-card">
        <div className="settings-card-heading">
          <div>
            <h2>Judge runtimes</h2>
            <p className="muted">
              Release builds bundle pinned Python and Node. Development builds may use an override
              or the host system.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void refreshJudge()}
            disabled={loadingJudge}
          >
            {loadingJudge ? 'Checking…' : 'Refresh'}
          </button>
        </div>

        {judgeStatus?.ok ? (
          <div className="runtime-list">
            {Object.values(judgeStatus.runtimes ?? {}).map((runtime) => (
              <div className="runtime-row" key={runtime.name}>
                <span className={`status-dot ${runtime.available ? '' : 'status-dot-error'}`} />
                <strong>{runtime.name}</strong>
                <span className="muted">
                  {runtime.source ? `${runtime.source} · ` : ''}
                  {runtime.version || runtime.error || 'Not found'}
                </span>
                <code>{runtime.path ? breakablePath(runtime.path) : '—'}</code>
              </div>
            ))}
          </div>
        ) : (
          <div className="callout callout-error" role="alert">
            <strong>Judge unavailable</strong>
            <p>{judgeStatus?.error ?? 'The sidecar is not running.'}</p>
          </div>
        )}
      </section>

      <section className="settings-card">
        <div className="settings-card-heading">
          <div>
            <h2>Diagnostics</h2>
            <p className="muted">
              Run a local self-test of the database, content, search index, judge, runtimes,
              storage, logs, and AI configuration. Nothing is sent over the network.
            </p>
          </div>
          <div className="settings-actions">
            {diagnostics ? (
              <Button
                variant="ghost"
                onClick={() => void copyDiagnostics()}
                data-testid="copy-diagnostics"
              >
                {diagnosticsCopied ? 'Copied' : 'Copy report'}
              </Button>
            ) : null}
            <Button
              variant="secondary"
              onClick={() => void runSelfTest()}
              disabled={runningDiagnostics}
              data-testid="run-diagnostics"
            >
              {runningDiagnostics ? 'Running…' : 'Run self-test'}
            </Button>
          </div>
        </div>

        {diagnostics ? (
          <>
            <div className="runtime-list" data-testid="diagnostics-report">
              {diagnostics.checks.map((check) => (
                <div className="runtime-row" key={check.id}>
                  <span
                    className={`status-dot ${
                      check.status === 'pass'
                        ? ''
                        : check.status === 'warn'
                          ? 'status-dot-warn'
                          : 'status-dot-error'
                    }`}
                  />
                  <strong>{check.label}</strong>
                  <span className="muted">{check.detail}</span>
                  <span className="muted small">{check.hint ?? ''}</span>
                </div>
              ))}
            </div>
            <p className="muted small" data-testid="diagnostics-summary">
              {diagnostics.ok
                ? 'All required checks passed.'
                : 'One or more checks need attention.'}{' '}
              Generated {new Date(diagnostics.generatedAt).toLocaleString()}.
            </p>
          </>
        ) : (
          <p className="muted">No self-test has run yet.</p>
        )}
      </section>

      <section className="settings-card">
        <div className="settings-card-heading">
          <div>
            <h2>Backup and transfer</h2>
            <p className="muted">
              Export attempts, drafts, notes, review cards, mistake tags, and settings as JSON. API
              keys are never included.
            </p>
          </div>
        </div>
        <div className="settings-actions">
          <Button
            variant="secondary"
            onClick={() => void exportData()}
            disabled={transferring !== null}
            data-testid="export-data"
          >
            {transferring === 'export' ? 'Exporting…' : 'Export data'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => void importData()}
            disabled={transferring !== null}
            data-testid="import-data"
          >
            {transferring === 'import' ? 'Importing…' : 'Import data'}
          </Button>
        </div>
        {transferStatus ? (
          <p className="muted small" data-testid="transfer-status">
            {transferStatus}
          </p>
        ) : null}
      </section>

      <section className="settings-card">
        <h2>Data and environment</h2>
        {appInfo ? (
          <dl className="info-grid">
            <div>
              <dt>App version</dt>
              <dd>{appInfo.appVersion}</dd>
            </div>
            <div>
              <dt>Platform</dt>
              <dd>{appInfo.platform}</dd>
            </div>
            <div>
              <dt>Electron</dt>
              <dd>{appInfo.versions.electron}</dd>
            </div>
            <div>
              <dt>Node</dt>
              <dd>{appInfo.versions.node}</dd>
            </div>
            <div className="info-wide">
              <dt>User data</dt>
              <dd>
                <code>{appInfo.userDataPath}</code>
              </dd>
            </div>
            <div className="info-wide">
              <dt>Database</dt>
              <dd>
                <code>{appInfo.databasePath}</code>
              </dd>
            </div>
            <div className="info-wide">
              <dt>Logs</dt>
              <dd>
                <code>{appInfo.logsPath}</code>
              </dd>
            </div>
          </dl>
        ) : (
          <p className="muted">Loading environment…</p>
        )}
        <p className="muted small">
          Backups are written at startup and the last seven verified copies are kept. No telemetry
          is collected.
        </p>
      </section>
    </div>
  )
}
