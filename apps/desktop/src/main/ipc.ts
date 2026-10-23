import { randomUUID } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { app, dialog, ipcMain } from 'electron'
import { z } from 'zod'
import type { AiContext } from '../shared/types'
import type { AiService } from './ai'
import type { ContentRepository } from './content'
import type { AppDatabase } from './database'
import type { JudgeClient } from './judge'

interface Services {
  readonly content: ContentRepository
  readonly database: AppDatabase
  readonly judge: JudgeClient
  readonly ai: AiService
}

const languageSchema = z.enum(['python', 'typescript'])

const failureSchema = z.object({
  index: z.number().int().nonnegative(),
  isSample: z.boolean(),
  status: z.string().max(100),
  input: z.unknown().optional(),
  expected: z.unknown().optional(),
  actual: z.unknown().optional(),
  userStdout: z.string().max(100_000),
  userStderr: z.string().max(100_000),
  runtimeMs: z.number().nonnegative(),
  memoryBytes: z.number().nonnegative(),
  error: z
    .object({
      type: z.string().max(200),
      message: z.string().max(10_000),
      stack: z.string().max(100_000),
      userLine: z.number().int().nonnegative(),
    })
    .optional(),
  message: z.string().max(10_000).optional(),
})

const runInputSchema = z.object({
  problemId: z.string().min(1).max(200),
  language: languageSchema,
  code: z.string().max(200_000),
  mode: z.enum(['sample', 'submit']),
})

const draftInputSchema = z.object({
  problemId: z.string().min(1).max(200),
  language: languageSchema,
})

const saveDraftSchema = draftInputSchema.extend({
  code: z.string().max(200_000),
})

const aiContextSchema: z.ZodType<AiContext> = z.object({
  problemId: z.string().min(1).max(200),
  language: languageSchema,
  code: z.string().max(200_000),
  failure: failureSchema.optional(),
}) as z.ZodType<AiContext>

const aiConfigSchema = z.object({
  type: z.enum(['none', 'mock', 'openai-compatible']),
  baseUrl: z.string().max(2000),
  model: z.string().max(200),
  apiKey: z.string().max(10_000).optional(),
  clearKey: z.boolean().optional(),
})

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

export function registerIpc({ content, database, judge, ai }: Services): void {
  ipcMain.handle('app:info', () => ({
    appVersion: app.getVersion(),
    platform: process.platform,
    versions: {
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
    },
    userDataPath: app.getPath('userData'),
    databasePath: database.path,
  }))

  ipcMain.handle('content:list', () => content.listProblems())
  ipcMain.handle('content:get', (_event, rawProblemId: unknown) => {
    const problemId = z.string().min(1).max(200).parse(rawProblemId)
    return content.getProblem(problemId)
  })

  ipcMain.handle('judge:status', () => judge.status())

  ipcMain.handle('judge:run', async (_event, rawInput: unknown) => {
    const input = runInputSchema.parse(rawInput)
    const params = content.getRunParams(input.problemId, input.language, input.code, input.mode)
    const result = await judge.run(params)

    database.saveAttempt({
      problemId: input.problemId,
      language: input.language,
      mode: input.mode,
      code: input.code,
      result,
    })

    return result
  })

  ipcMain.handle('draft:get', (_event, rawInput: unknown) => {
    const input = draftInputSchema.parse(rawInput)
    return database.getDraft(input.problemId, input.language)
  })

  ipcMain.handle('draft:save', (_event, rawInput: unknown) => {
    const input = saveDraftSchema.parse(rawInput)
    database.saveDraft(input.problemId, input.language, input.code)
  })

  ipcMain.handle('attempts:stats', () => database.getStats())

  ipcMain.handle('design:get-scene', () => database.getDesignScene())

  ipcMain.handle('design:save-scene', (_event, rawScene: unknown) => {
    const sceneJson = z.string().max(5_000_000).parse(rawScene)
    database.saveDesignScene(sceneJson)
  })

  ipcMain.handle('design:export-png', async (_event, rawDataUrl: unknown) => {
    const dataUrl = z.string().max(20_000_000).parse(rawDataUrl)
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

  ipcMain.handle('ai:get-status', () => ai.getStatus())

  ipcMain.handle('ai:save-config', (_event, rawInput: unknown) => {
    const input = aiConfigSchema.parse(rawInput)
    return ai.saveConfig(input)
  })

  ipcMain.handle('ai:preview', (_event, rawContext: unknown) => {
    const context = aiContextSchema.parse(rawContext)
    return ai.preview(context)
  })

  ipcMain.handle('ai:explain', async (event, rawContext: unknown) => {
    const context = aiContextSchema.parse(rawContext)
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
}
