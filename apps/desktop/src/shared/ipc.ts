/**
 * Shared IPC contract primitives. Keep this module dependency-free so the
 * sandboxed preload can import it without bundling Zod or Node modules.
 */
export const channels = {
  appInfo: 'app:info',
  appDiagnostics: 'app:diagnostics',
  appReadClipboardText: 'app:read-clipboard-text',
  appOpenLogs: 'app:open-logs',
  contentList: 'content:list',
  contentCollections: 'content:collections',
  contentGet: 'content:get',
  contentSearch: 'content:search',
  learnList: 'learn:list',
  learnGet: 'learn:get',
  learnProgress: 'learn:progress',
  learnSetComplete: 'learn:set-complete',
  judgeStatus: 'judge:status',
  judgeRun: 'judge:run',
  judgeCancel: 'judge:cancel',
  judgeEvent: 'judge:event',
  draftGet: 'draft:get',
  draftSave: 'draft:save',
  attemptsStats: 'attempts:stats',
  attemptsList: 'attempts:list',
  attemptsRecent: 'attempts:recent',
  attemptsGet: 'attempts:get',
  attemptsTag: 'attempts:tag',
  mistakesList: 'mistakes:list',
  reviewQueue: 'review:queue',
  reviewPreview: 'review:preview',
  reviewGrade: 'review:grade',
  progressSummary: 'progress:summary',
  progressToday: 'progress:today',
  progressProblems: 'progress:problems',
  dataExport: 'data:export',
  dataImport: 'data:import',
  notesGet: 'notes:get',
  notesSave: 'notes:save',
  designGetScene: 'design:get-scene',
  designSaveScene: 'design:save-scene',
  designExportPng: 'design:export-png',
  designListScenarios: 'design:list-scenarios',
  designGetScenario: 'design:get-scenario',
  designGetDraft: 'design:get-draft',
  designSaveDraft: 'design:save-draft',
  designSubmit: 'design:submit',
  designListAttempts: 'design:list-attempts',
  designGetAttempt: 'design:get-attempt',
  designExportAttempt: 'design:export-attempt',
  aiGetStatus: 'ai:get-status',
  aiSaveConfig: 'ai:save-config',
  aiTestConnection: 'ai:test-connection',
  aiPreview: 'ai:preview',
  aiRun: 'ai:run',
  aiCancel: 'ai:cancel',
  aiFeedback: 'ai:feedback',
  settingsGet: 'settings:get',
  settingsUpdate: 'settings:update',
  packsList: 'packs:list',
  packsPreview: 'packs:preview',
  packsInstall: 'packs:install',
  packsUninstall: 'packs:uninstall',
} as const

export type Channel = (typeof channels)[keyof typeof channels]

export type IpcErrorCode =
  'invalid_request' | 'not_found' | 'judge_unavailable' | 'timeout' | 'cancelled' | 'internal_error'

export interface IpcError {
  readonly code: IpcErrorCode
  readonly message: string
}

export type IpcResult<T> =
  { readonly ok: true; readonly data: T } | { readonly ok: false; readonly error: IpcError }
