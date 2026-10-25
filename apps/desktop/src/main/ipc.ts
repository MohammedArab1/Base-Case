import { randomUUID } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { app, dialog, ipcMain } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'
import type { ZodType } from 'zod'
import { channels } from '../shared/ipc'
import type { Channel, IpcResult } from '../shared/ipc'
import type { AiContext } from '../shared/types'
import type { AiService } from './ai'
import type { ContentRepository } from './content'
import { toIpcError } from './ipc-errors'
import {
  aiConfigSchema,
  aiContextSchema,
  draftInputSchema,
  noInputSchema,
  packIdSchema,
  packImportKindSchema,
  packTokenSchema,
  pngDataUrlSchema,
  problemIdSchema,
  problemNoteSchema,
  runInputSchema,
  saveDraftSchema,
  sceneJsonSchema,
  searchQuerySchema,
  settingsPatchSchema,
} from './ipc-schemas'
import type { JudgeClient } from './judge'
import { getLogger } from './logger'
import type { PackManager } from './pack-manager'
import type { AttemptsRepository } from './repositories/attempts'
import type { ContentIndexRepository } from './repositories/content-index'
import type { DesignRepository } from './repositories/design'
import type { DraftsRepository } from './repositories/drafts'
import type { ProblemNotesRepository } from './repositories/notes'
import type { SettingsStore } from './settings'

interface Services {
  readonly content: ContentRepository
  readonly contentIndex: ContentIndexRepository
  readonly attempts: AttemptsRepository
  readonly drafts: DraftsRepository
  readonly design: DesignRepository
  readonly notes: ProblemNotesRepository
  readonly judge: JudgeClient
  readonly ai: AiService
  readonly settings: SettingsStore
  readonly packs: PackManager
  readonly databasePath: string
}

function register<I, O>(
  channel: Channel,
  inputSchema: ZodType<I>,
  handler: (input: I, event: IpcMainInvokeEvent) => O | Promise<O>,
): void {
  const log = getLogger('ipc')

  ipcMain.handle(channel, async (event, rawInput: unknown) => {
    const started = performance.now()

    try {
      const input = inputSchema.parse(rawInput)
      const data = await handler(input, event)

      log.debug('ipc.completed', {
        channel,
        durationMs: Math.round(performance.now() - started),
      })

      return { ok: true, data } satisfies IpcResult<O>
    } catch (error) {
      const normalized = toIpcError(error)

      log.warn('ipc.failed', {
        channel,
        code: normalized.code,
        message: normalized.message,
        durationMs: Math.round(performance.now() - started),
      })

      return { ok: false, error: normalized } satisfies IpcResult<O>
    }
  })
}

function sendAiEvent(
  sender: Electron.WebContents,
  event:
    | { requestId: string; type: 'chunk'; text: string }
    | { requestId: string; type: 'done' }
    | { requestId: string; type: 'error'; message: string },
): void {
  if (!sender.isDestroyed()) {
    sender.send('ai:event', event)
  }
}

export function registerIpc({
  content,
  contentIndex,
  attempts,
  drafts,
  design,
  notes,
  judge,
  ai,
  settings,
  packs,
  databasePath,
}: Services): void {
  register(channels.appInfo, noInputSchema, () => ({
    appVersion: app.getVersion(),
    platform: process.platform,
    versions: {
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
    },
    userDataPath: app.getPath('userData'),
    databasePath,
    logsPath: join(app.getPath('userData'), 'logs'),
  }))

  register(channels.contentList, noInputSchema, () => content.listProblems())
  register(channels.contentGet, problemIdSchema, (problemId) => content.getProblem(problemId))
  register(channels.contentSearch, searchQuerySchema, (query) =>
    content.getSummaries(contentIndex.search(query)),
  )

  register(channels.judgeStatus, noInputSchema, () => judge.status())

  register(channels.judgeRun, runInputSchema, async (input) => {
    const params = content.getRunParams(input.problemId, input.language, input.code, input.mode)
    const result = await judge.run(params)

    attempts.save({
      problemId: input.problemId,
      language: input.language,
      mode: input.mode,
      code: input.code,
      result,
    })

    return result
  })

  register(channels.draftGet, draftInputSchema, (input) =>
    drafts.get(input.problemId, input.language),
  )

  register(channels.draftSave, saveDraftSchema, (input) => {
    drafts.save(input.problemId, input.language, input.code)
  })

  register(channels.attemptsStats, noInputSchema, () => attempts.getStats())
  register(channels.attemptsList, problemIdSchema, (problemId) =>
    attempts.listForProblem(problemId),
  )

  register(channels.notesGet, problemIdSchema, (problemId) => notes.get(problemId))
  register(channels.notesSave, problemNoteSchema, (input) =>
    notes.save(input.problemId, input.notes),
  )

  register(channels.designGetScene, noInputSchema, () => design.getScene())

  register(channels.designSaveScene, sceneJsonSchema, (sceneJson) => {
    design.saveScene(sceneJson)
  })

  register(channels.designExportPng, pngDataUrlSchema, async (dataUrl) => {
    const match = /^data:image\/png;base64,(.+)$/.exec(dataUrl)

    if (!match?.[1]) {
      throw new Error('Expected a base64 PNG data URL.')
    }

    const selection = await dialog.showSaveDialog({
      title: 'Export design as PNG',
      defaultPath: 'base-case-design.png',
      filters: [{ name: 'PNG image', extensions: ['png'] }],
    })

    if (selection.canceled || !selection.filePath) {
      return { saved: false }
    }

    await writeFile(selection.filePath, Buffer.from(match[1], 'base64'))
    return { saved: true, path: selection.filePath }
  })

  register(channels.aiGetStatus, noInputSchema, () => ai.getStatus())

  register(channels.aiSaveConfig, aiConfigSchema, (input) => ai.saveConfig(input))

  register(channels.aiPreview, aiContextSchema, (input) => ai.preview(input))

  register(channels.aiExplain, aiContextSchema, (context: AiContext, event) => {
    const requestId = randomUUID()

    void ai
      .stream(context, (text) => {
        sendAiEvent(event.sender, { requestId, type: 'chunk', text })
      })
      .then(() => {
        sendAiEvent(event.sender, { requestId, type: 'done' })
      })
      .catch((error: unknown) => {
        sendAiEvent(event.sender, {
          requestId,
          type: 'error',
          message: error instanceof Error ? error.message : String(error),
        })
      })

    return { requestId }
  })

  register(channels.settingsGet, noInputSchema, () => settings.get())
  register(channels.settingsUpdate, settingsPatchSchema, (patch) => settings.update(patch))

  register(channels.packsList, noInputSchema, () => content.listPacks())
  register(channels.packsPreview, packImportKindSchema, (kind) => packs.preview(kind))
  register(channels.packsInstall, packTokenSchema, (token) => packs.install(token))
  register(channels.packsUninstall, packIdSchema, (packId) => packs.uninstall(packId))
}
