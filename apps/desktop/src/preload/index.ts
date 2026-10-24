import { contextBridge, ipcRenderer } from 'electron'
import { channels } from '../shared/ipc'
import type { Channel, IpcResult } from '../shared/ipc'
import type {
  AiContext,
  AiEvent,
  AppInfo,
  AppSettings,
  BaseCaseApi,
  ContentPackSummary,
  DesignScenePayload,
  DraftInput,
  JudgeStatus,
  PackImportKind,
  PackPreviewResult,
  ProblemDetail,
  ProblemSummary,
  RunInput,
  RunResult,
  SaveAiConfigInput,
  SaveDraftInput,
  SettingsPatch,
  Stats,
} from '../shared/types'

interface BridgeError extends Error {
  code?: string
}

async function invoke<O>(channel: Channel, input?: unknown): Promise<O> {
  const result = (await ipcRenderer.invoke(channel, input)) as IpcResult<O>

  if (result?.ok) {
    return result.data
  }

  const error = new Error(result?.error?.message ?? 'The app returned an invalid IPC response.')
  error.name = 'BaseCaseIpcError'
  ;(error as BridgeError).code = result?.error?.code
  throw error
}

const api: BaseCaseApi = {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
  app: {
    getInfo: () => invoke<AppInfo>(channels.appInfo),
  },
  content: {
    list: () => invoke<ProblemSummary[]>(channels.contentList),
    get: (problemId: string) => invoke<ProblemDetail>(channels.contentGet, problemId),
    search: (query: string) => invoke<ProblemSummary[]>(channels.contentSearch, query),
  },
  judge: {
    run: (input: RunInput) => invoke<RunResult>(channels.judgeRun, input),
    status: () => invoke<JudgeStatus>(channels.judgeStatus),
  },
  drafts: {
    get: (input: DraftInput) => invoke<string | null>(channels.draftGet, input),
    save: (input: SaveDraftInput) => invoke<void>(channels.draftSave, input),
  },
  attempts: {
    stats: () => invoke<Stats>(channels.attemptsStats),
  },
  settings: {
    get: () => invoke<AppSettings>(channels.settingsGet),
    update: (patch: SettingsPatch) => invoke<AppSettings>(channels.settingsUpdate, patch),
  },
  packs: {
    list: () => invoke<ContentPackSummary[]>(channels.packsList),
    preview: (kind: PackImportKind) =>
      invoke<PackPreviewResult | null>(channels.packsPreview, kind),
    install: (token: string) => invoke<ContentPackSummary>(channels.packsInstall, token),
    uninstall: (packId: string) => invoke<void>(channels.packsUninstall, packId),
  },
  design: {
    getScene: () => invoke<DesignScenePayload>(channels.designGetScene),
    saveScene: (sceneJson: string) => invoke<void>(channels.designSaveScene, sceneJson),
    exportPng: (dataUrl: string) =>
      invoke<{ saved: boolean; path?: string }>(channels.designExportPng, dataUrl),
  },
  ai: {
    getStatus: () => invoke(channels.aiGetStatus),
    saveConfig: (input: SaveAiConfigInput) => invoke(channels.aiSaveConfig, input),
    preview: (context: AiContext) => invoke(channels.aiPreview, context),
    explain: (context: AiContext) => invoke(channels.aiExplain, context),
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
