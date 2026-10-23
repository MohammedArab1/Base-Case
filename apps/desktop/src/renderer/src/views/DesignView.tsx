import { useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import { Excalidraw, exportToBlob, serializeAsJSON } from '@excalidraw/excalidraw'
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types'
import '@excalidraw/excalidraw/index.css'

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the PNG blob.'))
    reader.readAsDataURL(blob)
  })
}

export function DesignView(): JSX.Element {
  const [initialScene, setInitialScene] = useState<ExcalidrawInitialDataState | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [exportState, setExportState] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null)
  const saveTimer = useRef<number | null>(null)
  const lastInput = useRef<{ elements: unknown; files: unknown } | null>(null)
  const lastSavedScene = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void window.baseCase.design
      .getScene()
      .then((payload) => {
        if (cancelled) {
          return
        }

        if (payload.sceneJson) {
          try {
            setInitialScene(JSON.parse(payload.sceneJson) as ExcalidrawInitialDataState)
            lastSavedScene.current = payload.sceneJson
          } catch {
            setLoadError('The saved canvas could not be parsed. Starting a fresh scene.')
          }
        }

        setLoaded(true)
      })
      .catch((sceneError: unknown) => {
        if (!cancelled) {
          setLoadError(sceneError instanceof Error ? sceneError.message : String(sceneError))
          setLoaded(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return () => {
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current)
      }
    }
  }, [])

  const exportPng = async (): Promise<void> => {
    const api = apiRef.current
    if (!api) {
      return
    }

    setExporting(true)
    setExportState(null)

    try {
      const blob = await exportToBlob({
        elements: api.getSceneElements(),
        appState: api.getAppState(),
        files: api.getFiles(),
        mimeType: 'image/png',
      })
      const dataUrl = await blobToDataUrl(blob)
      const result = await window.baseCase.design.exportPng(dataUrl)
      setExportState(result.saved ? 'PNG exported.' : 'Export cancelled.')
    } catch (exportError: unknown) {
      setExportState(exportError instanceof Error ? exportError.message : String(exportError))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="workspace-stack design-workspace">
      <div className="list-toolbar">
        <div>
          <h2>Canvas sandbox</h2>
          <p className="muted">
            Phase 1 spike: draw, reload, and confirm the scene persists locally and exports to PNG.
          </p>
        </div>
        <div className="toolbar-actions">
          <span className="muted save-indicator">
            {saveState === 'saving'
              ? 'Saving…'
              : saveState === 'saved'
                ? 'Saved locally'
                : saveState === 'error'
                  ? 'Save failed'
                  : 'Autosave on'}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void exportPng()}
            disabled={exporting || !loaded}
          >
            {exporting ? 'Exporting…' : 'Export PNG'}
          </button>
        </div>
      </div>

      {loadError ? (
        <div className="callout callout-error">
          <strong>Canvas warning</strong>
          <p>{loadError}</p>
        </div>
      ) : null}

      {exportState ? <p className="muted">{exportState}</p> : null}

      <div className="canvas-wrap">
        {loaded ? (
          <Excalidraw
            excalidrawAPI={(api) => {
              apiRef.current = api
            }}
            initialData={initialScene ?? undefined}
            onChange={(elements, appState, files) => {
              if (!loaded) {
                return
              }

              // Excalidraw also emits onChange for cursor and UI state. Only a
              // new elements or files reference represents scene content, so
              // pointer movement must not reset the debounce or write the DB.
              const contentChanged =
                lastInput.current === null ||
                elements !== lastInput.current.elements ||
                files !== lastInput.current.files
              lastInput.current = { elements, files }

              if (!contentChanged) {
                return
              }

              setSaveState('saving')

              if (saveTimer.current !== null) {
                window.clearTimeout(saveTimer.current)
              }

              saveTimer.current = window.setTimeout(() => {
                const sceneJson = serializeAsJSON(elements, appState, files, 'local')

                if (sceneJson === lastSavedScene.current) {
                  setSaveState('saved')
                  return
                }

                void window.baseCase.design
                  .saveScene(sceneJson)
                  .then(() => {
                    lastSavedScene.current = sceneJson
                    setSaveState('saved')
                  })
                  .catch(() => setSaveState('error'))
              }, 800)
            }}
          />
        ) : (
          <p className="muted canvas-loading">Loading canvas…</p>
        )}
      </div>
    </div>
  )
}
