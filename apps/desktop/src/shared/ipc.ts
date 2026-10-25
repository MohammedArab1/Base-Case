/**
 * Shared IPC contract primitives. Keep this module dependency-free so the
 * sandboxed preload can import it without bundling Zod or Node modules.
 */
export const channels = {
  appInfo: 'app:info',
  contentList: 'content:list',
  contentGet: 'content:get',
  contentSearch: 'content:search',
  judgeStatus: 'judge:status',
  judgeRun: 'judge:run',
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
  notesGet: 'notes:get',
  notesSave: 'notes:save',
  designGetScene: 'design:get-scene',
  designSaveScene: 'design:save-scene',
  designExportPng: 'design:export-png',
  aiGetStatus: 'ai:get-status',
  aiSaveConfig: 'ai:save-config',
  aiPreview: 'ai:preview',
  aiExplain: 'ai:explain',
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
