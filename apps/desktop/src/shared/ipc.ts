/**
 * Shared IPC contract primitives. Keep this module dependency-free so the
 * sandboxed preload can import it without bundling Zod or Node modules.
 */
export const channels = {
  appInfo: 'app:info',
  contentList: 'content:list',
  contentGet: 'content:get',
  judgeStatus: 'judge:status',
  judgeRun: 'judge:run',
  draftGet: 'draft:get',
  draftSave: 'draft:save',
  attemptsStats: 'attempts:stats',
  designGetScene: 'design:get-scene',
  designSaveScene: 'design:save-scene',
  designExportPng: 'design:export-png',
  aiGetStatus: 'ai:get-status',
  aiSaveConfig: 'ai:save-config',
  aiPreview: 'ai:preview',
  aiExplain: 'ai:explain',
  settingsGet: 'settings:get',
  settingsUpdate: 'settings:update',
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
