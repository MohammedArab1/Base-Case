import { contextBridge, ipcRenderer } from 'electron'
import { channels } from '../shared/ipc'
import type { Channel, IpcResult } from '../shared/ipc'
import type {
  AiEvent,
  AiFeedbackInput,
  AiRequest,
  AppInfo,
  AppSettings,
  BaseCaseApi,
  AttemptDetail,
  AttemptSummary,
  ContentPackSummary,
  DataTransferResult,
  DesignAttemptDetail,
  DesignAttemptSummary,
  DesignDraft,
  DesignScenarioDetail,
  DesignScenarioSummary,
  DesignScenePayload,
  DraftInput,
  DraftRecord,
  ExportDesignAttemptInput,
  ExportDesignAttemptResult,
  GradeReviewInput,
  GradeReviewResult,
  JudgeRunEvent,
  JudgeStatus,
  MistakeTag,
  PackImportKind,
  PackPreviewResult,
  ProblemDetail,
  ProblemNote,
  ProblemProgressEntry,
  ProblemSummary,
  ProgressSummary,
  ReviewPreview,
  ReviewQueue,
  RunInput,
  RunResult,
  SaveAiConfigInput,
  SaveDesignDraftInput,
  SaveDraftInput,
  SaveProblemNoteInput,
  SettingsPatch,
  Stats,
  SubmitDesignInput,
  TagAttemptInput,
  TodaySummary,
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
    cancel: (requestId: string) => invoke<boolean>(channels.judgeCancel, requestId),
    status: () => invoke<JudgeStatus>(channels.judgeStatus),
    onEvent: (listener: (event: JudgeRunEvent) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, payload: JudgeRunEvent): void => {
        listener(payload)
      }
      ipcRenderer.on(channels.judgeEvent, handler)
      return () => {
        ipcRenderer.removeListener(channels.judgeEvent, handler)
      }
    },
  },
  drafts: {
    get: (input: DraftInput) => invoke<DraftRecord | null>(channels.draftGet, input),
    save: (input: SaveDraftInput) => invoke<void>(channels.draftSave, input),
  },
  attempts: {
    stats: () => invoke<Stats>(channels.attemptsStats),
    list: (problemId: string) => invoke<AttemptSummary[]>(channels.attemptsList, problemId),
    recent: (limit?: number) => invoke<AttemptSummary[]>(channels.attemptsRecent, limit),
    get: (attemptId: string) => invoke<AttemptDetail>(channels.attemptsGet, attemptId),
    tag: (input: TagAttemptInput) => invoke<AttemptDetail>(channels.attemptsTag, input),
  },
  mistakes: {
    list: () => invoke<MistakeTag[]>(channels.mistakesList),
  },
  review: {
    queue: () => invoke<ReviewQueue>(channels.reviewQueue),
    preview: (cardId: string) => invoke<ReviewPreview[]>(channels.reviewPreview, cardId),
    grade: (input: GradeReviewInput) => invoke<GradeReviewResult>(channels.reviewGrade, input),
  },
  progress: {
    summary: () => invoke<ProgressSummary>(channels.progressSummary),
    today: () => invoke<TodaySummary>(channels.progressToday),
    problems: () => invoke<ProblemProgressEntry[]>(channels.progressProblems),
  },
  data: {
    export: () => invoke<DataTransferResult>(channels.dataExport),
    import: () => invoke<DataTransferResult>(channels.dataImport),
  },
  notes: {
    get: (problemId: string) => invoke<ProblemNote>(channels.notesGet, problemId),
    save: (input: SaveProblemNoteInput) => invoke<ProblemNote>(channels.notesSave, input),
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
    listScenarios: () => invoke<DesignScenarioSummary[]>(channels.designListScenarios),
    getScenario: (scenarioId: string) =>
      invoke<DesignScenarioDetail>(channels.designGetScenario, scenarioId),
    getDraft: (scenarioId: string) => invoke<DesignDraft>(channels.designGetDraft, scenarioId),
    saveDraft: (input: SaveDesignDraftInput) =>
      invoke<DesignDraft>(channels.designSaveDraft, input),
    submit: (input: SubmitDesignInput) =>
      invoke<DesignAttemptSummary>(channels.designSubmit, input),
    listAttempts: (scenarioId: string) =>
      invoke<DesignAttemptSummary[]>(channels.designListAttempts, scenarioId),
    getAttempt: (attemptId: string) =>
      invoke<DesignAttemptDetail>(channels.designGetAttempt, attemptId),
    exportAttempt: (input: ExportDesignAttemptInput) =>
      invoke<ExportDesignAttemptResult>(channels.designExportAttempt, input),
    getScene: () => invoke<DesignScenePayload>(channels.designGetScene),
    saveScene: (sceneJson: string) => invoke<void>(channels.designSaveScene, sceneJson),
    exportPng: (dataUrl: string) =>
      invoke<{ saved: boolean; path?: string }>(channels.designExportPng, dataUrl),
  },
  ai: {
    getStatus: () => invoke(channels.aiGetStatus),
    saveConfig: (input: SaveAiConfigInput) => invoke(channels.aiSaveConfig, input),
    testConnection: () => invoke(channels.aiTestConnection),
    preview: (request: AiRequest) => invoke(channels.aiPreview, request),
    run: (request: AiRequest) => invoke(channels.aiRun, request),
    cancel: (requestId: string) => invoke<boolean>(channels.aiCancel, requestId),
    feedback: (input: AiFeedbackInput) => invoke<void>(channels.aiFeedback, input),
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
