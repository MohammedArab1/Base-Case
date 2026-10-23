import { contextBridge, ipcRenderer } from 'electron'
import type {
  AiContext,
  AiEvent,
  BaseCaseApi,
  DraftInput,
  RunInput,
  SaveAiConfigInput,
  SaveDraftInput,
} from '../shared/types'

const api: BaseCaseApi = {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
  app: {
    getInfo: () => ipcRenderer.invoke('app:info'),
  },
  content: {
    list: () => ipcRenderer.invoke('content:list'),
    get: (problemId: string) => ipcRenderer.invoke('content:get', problemId),
  },
  judge: {
    run: (input: RunInput) => ipcRenderer.invoke('judge:run', input),
    status: () => ipcRenderer.invoke('judge:status'),
  },
  drafts: {
    get: (input: DraftInput) => ipcRenderer.invoke('draft:get', input),
    save: (input: SaveDraftInput) => ipcRenderer.invoke('draft:save', input),
  },
  attempts: {
    stats: () => ipcRenderer.invoke('attempts:stats'),
  },
  design: {
    getScene: () => ipcRenderer.invoke('design:get-scene'),
    saveScene: (sceneJson: string) => ipcRenderer.invoke('design:save-scene', sceneJson),
    exportPng: (dataUrl: string) => ipcRenderer.invoke('design:export-png', dataUrl),
  },
  ai: {
    getStatus: () => ipcRenderer.invoke('ai:get-status'),
    saveConfig: (input: SaveAiConfigInput) => ipcRenderer.invoke('ai:save-config', input),
    preview: (context: AiContext) => ipcRenderer.invoke('ai:preview', context),
    explain: (context: AiContext) => ipcRenderer.invoke('ai:explain', context),
    onEvent: (listener: (event: AiEvent) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, payload: AiEvent): void => {
        listener(payload)
      }
      ipcRenderer.on('ai:event', handler)
      return () => {
        ipcRenderer.removeListener('ai:event', handler)
      }
    },
  },
}

contextBridge.exposeInMainWorld('baseCase', api)
