import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import type {
  AiProviderStatus,
  AiProviderType,
  AppInfo,
  JudgeStatus,
  SaveAiConfigInput,
} from '../../../shared/types'

interface AiForm {
  readonly type: AiProviderType
  readonly baseUrl: string
  readonly model: string
  readonly apiKey: string
}

const defaultBaseUrl = 'https://api.openai.com/v1'
const defaultModel = 'gpt-4o-mini'

export function SettingsView(): JSX.Element {
  const [provider, setProvider] = useState<AiProviderStatus | null>(null)
  const [judgeStatus, setJudgeStatus] = useState<JudgeStatus | null>(null)
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [form, setForm] = useState<AiForm>({
    type: 'none',
    baseUrl: defaultBaseUrl,
    model: defaultModel,
    apiKey: '',
  })
  const [clearKey, setClearKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingJudge, setLoadingJudge] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void Promise.all([
      window.baseCase.ai.getStatus(),
      window.baseCase.judge.status(),
      window.baseCase.app.getInfo(),
    ])
      .then(([aiStatus, nextJudgeStatus, info]) => {
        if (cancelled) {
          return
        }

        setProvider(aiStatus)
        setJudgeStatus(nextJudgeStatus)
        setAppInfo(info)
        setForm({
          type: aiStatus.type,
          baseUrl: aiStatus.baseUrl || defaultBaseUrl,
          model: aiStatus.model || defaultModel,
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

  const save = async (): Promise<void> => {
    setSaving(true)
    setMessage(null)
    setError(null)

    const input: SaveAiConfigInput = {
      type: form.type,
      baseUrl: form.baseUrl,
      model: form.model,
      ...(form.apiKey.trim() ? { apiKey: form.apiKey.trim() } : {}),
      ...(clearKey ? { clearKey: true } : {}),
    }

    try {
      const nextProvider = await window.baseCase.ai.saveConfig(input)
      setProvider(nextProvider)
      setForm((current) => ({ ...current, apiKey: '' }))
      setClearKey(false)
      setMessage(
        nextProvider.enabled
          ? 'AI provider saved and enabled.'
          : 'AI provider saved, but it is not enabled.',
      )
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : String(saveError))
    } finally {
      setSaving(false)
    }
  }

  const isCompatible = form.type === 'openai-compatible'

  return (
    <div className="settings-stack">
      {error ? (
        <div className="callout callout-error">
          <strong>Something went wrong.</strong>
          <p>{error}</p>
        </div>
      ) : null}

      <section className="settings-card">
        <div className="settings-card-heading">
          <div>
            <h2>AI provider</h2>
            <p className="muted">
              Optional. Keys are encrypted with the OS keychain and never exposed to the renderer.
            </p>
          </div>
          <span className={`badge ${provider?.enabled ? '' : 'badge-muted'}`}>
            {provider?.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Provider</span>
            <select
              className="input"
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
            className="btn btn-primary"
            onClick={() => void save()}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save provider'}
          </button>
        </div>

        {message ? <p className="muted">{message}</p> : null}
        <p className="muted small">
          The mock provider returns a canned Socratic hint. A real provider is called only after the
          context preview is confirmed. Local endpoints such as Ollama work without a key.
        </p>
      </section>

      <section className="settings-card">
        <div className="settings-card-heading">
          <div>
            <h2>Judge runtimes</h2>
            <p className="muted">System Python and Node are used in the Phase 1 spike.</p>
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
                <span className="muted">{runtime.version || runtime.error || 'Not found'}</span>
                <code>{runtime.path || '—'}</code>
              </div>
            ))}
          </div>
        ) : (
          <div className="callout callout-error">
            <strong>Judge unavailable</strong>
            <p>{judgeStatus?.error ?? 'The sidecar is not running.'}</p>
          </div>
        )}
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
