import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { app, clipboard, dialog, ipcMain, shell } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'
import type { ZodType } from 'zod'
import { channels } from '../shared/ipc'
import type { Channel, IpcResult } from '../shared/ipc'
import type { AiEvent, JudgeRunEvent, ReviewCard, ReviewQueueItem } from '../shared/types'
import type { AiService } from './ai'
import type { ContentRepository } from './content'
import type { AppDatabase } from './database'
import { renderDesignAttemptMarkdown } from './design-export'
import { AppError, toIpcError } from './ipc-errors'
import {
  aiConfigSchema,
  aiFeedbackSchema,
  aiRequestSchema,
  attemptIdSchema,
  cardIdSchema,
  designAttemptIdSchema,
  designScenarioIdSchema,
  draftInputSchema,
  exportDesignAttemptSchema,
  gradeReviewSchema,
  lessonIdSchema,
  noInputSchema,
  packIdSchema,
  packImportKindSchema,
  packTokenSchema,
  pngDataUrlSchema,
  problemIdSchema,
  problemNoteSchema,
  recentAttemptsSchema,
  requestIdSchema,
  runInputSchema,
  saveDesignDraftSchema,
  saveDraftSchema,
  sceneJsonSchema,
  searchQuerySchema,
  setLessonCompleteSchema,
  settingsPatchSchema,
  submitDesignSchema,
  tagAttemptSchema,
} from './ipc-schemas'
import type { JudgeClient } from './judge'
import { getLogger } from './logger'
import { runDiagnostics } from './diagnostics'
import { AiProviderError } from './ai-providers/types'
import type { PackManager } from './pack-manager'
import type { AttemptsRepository } from './repositories/attempts'
import type { ContentIndexRepository } from './repositories/content-index'
import type { DesignRepository } from './repositories/design'
import type { DraftsRepository } from './repositories/drafts'
import type { LessonProgressRepository } from './repositories/lessons'
import type { MistakesRepository } from './repositories/mistakes'
import type { ProblemNotesRepository } from './repositories/notes'
import type { ReviewRepository } from './repositories/review'
import type { UserDataRepository } from './repositories/user-data'
import type { SettingsStore } from './settings'
import { localDayKey, startOfLocalDay, streakLength } from './time'

interface Services {
  readonly content: ContentRepository
  readonly contentIndex: ContentIndexRepository
  readonly attempts: AttemptsRepository
  readonly drafts: DraftsRepository
  readonly design: DesignRepository
  readonly notes: ProblemNotesRepository
  readonly review: ReviewRepository
  readonly mistakes: MistakesRepository
  readonly lessons: LessonProgressRepository
  readonly userData: UserDataRepository
  readonly judge: JudgeClient
  readonly ai: AiService
  readonly settings: SettingsStore
  readonly packs: PackManager
  readonly database: AppDatabase
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

function sendAiEvent(sender: Electron.WebContents, event: AiEvent): void {
  if (!sender.isDestroyed()) {
    sender.send('ai:event', event)
  }
}

function sendJudgeEvent(sender: Electron.WebContents, event: JudgeRunEvent): void {
  if (!sender.isDestroyed()) {
    sender.send(channels.judgeEvent, event)
  }
}

export function registerIpc({
  content,
  contentIndex,
  attempts,
  drafts,
  design,
  notes,
  review,
  mistakes,
  lessons,
  userData,
  judge,
  ai,
  settings,
  packs,
  database,
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
    databasePath: database.path,
    logsPath: join(app.getPath('userData'), 'logs'),
  }))

  register(channels.appDiagnostics, noInputSchema, () =>
    runDiagnostics({
      appVersion: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      database,
      content,
      contentIndex,
      judge,
      ai,
      userDataPath: app.getPath('userData'),
      logsPath: join(app.getPath('userData'), 'logs'),
    }),
  )

  register(channels.appReadClipboardText, noInputSchema, () => clipboard.readText())

  register(channels.appOpenLogs, noInputSchema, async () => {
    const error = await shell.openPath(join(app.getPath('userData'), 'logs'))
    return error.length === 0
  })

  register(channels.contentList, noInputSchema, () => content.listProblems())
  register(channels.contentCollections, noInputSchema, () => content.listCollections())
  register(channels.contentGet, problemIdSchema, (problemId) => content.getProblem(problemId))
  register(channels.contentSearch, searchQuerySchema, (query) =>
    content.getSummaries(contentIndex.search(query)),
  )

  register(channels.learnList, noInputSchema, () => content.listLessons())
  register(channels.learnGet, lessonIdSchema, (lessonId) => {
    const lesson = content.getLesson(lessonId)

    try {
      lessons.touch(lessonId)
    } catch (error) {
      // A recency write must never hide a readable lesson.
      getLogger('learn').warn('progress.touch_failed', {
        lessonId,
        message: error instanceof Error ? error.message : String(error),
      })
    }

    return lesson
  })
  register(channels.learnProgress, noInputSchema, () => lessons.list())
  register(channels.learnSetComplete, setLessonCompleteSchema, (input) => {
    if (!content.hasLesson(input.lessonId)) {
      throw new AppError('not_found', `Unknown lesson: ${input.lessonId}`)
    }

    return lessons.setComplete(input.lessonId, input.completed)
  })

  register(channels.judgeStatus, noInputSchema, () => judge.status())

  register(channels.judgeRun, runInputSchema, async (input, event) => {
    const requestId = input.requestId ?? randomUUID()
    const params = content.getRunParams(input.problemId, input.language, input.code, input.mode)

    try {
      const result = await judge.run(params, {
        requestId,
        onEvent: (judgeEvent) => {
          if (judgeEvent.event !== 'test_result') {
            return
          }

          const payload = judgeEvent.result as
            | {
                index?: number
                isSample?: boolean
                status?: string
                runtimeMs?: number
                memoryBytes?: number
              }
            | undefined

          if (!payload) {
            return
          }

          sendJudgeEvent(event.sender, {
            requestId,
            type: 'test',
            index: Number(payload.index ?? 0),
            isSample: Boolean(payload.isSample),
            status: String(payload.status ?? ''),
            runtimeMs: Number(payload.runtimeMs ?? 0),
            memoryBytes: Number(payload.memoryBytes ?? 0),
          })
        },
      })

      attempts.save({
        problemId: input.problemId,
        language: input.language,
        mode: input.mode,
        code: input.code,
        result,
        plan: input.plan,
        hintsUsed: input.hintsUsed,
        solutionViewed: input.solutionViewed,
      })

      // Sample runs never schedule a card; review runs are graded explicitly so a
      // single review session cannot update the card twice.
      if (result.status !== 'cancelled') {
        review.applyAttempt({
          problemId: input.problemId,
          mode: input.mode,
          status: result.status,
          hintsUsed: input.hintsUsed ?? 0,
          solutionViewed: input.solutionViewed ?? false,
        })
      }

      sendJudgeEvent(event.sender, { requestId, type: 'done' })
      return result
    } catch (error) {
      sendJudgeEvent(event.sender, {
        requestId,
        type: 'error',
        message: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  })

  register(channels.judgeCancel, requestIdSchema, (requestId) => judge.cancel(requestId))

  register(channels.draftGet, draftInputSchema, (input) =>
    drafts.get(input.problemId, input.language),
  )

  register(channels.draftSave, saveDraftSchema, (input) => {
    drafts.save(input.problemId, input.language, input.code, input.plan)
  })

  register(channels.attemptsStats, noInputSchema, () => attempts.getStats())
  register(channels.attemptsList, problemIdSchema, (problemId) =>
    attempts.listForProblem(problemId),
  )
  register(channels.attemptsRecent, recentAttemptsSchema, (limit) =>
    attempts.listRecent(limit ?? 20),
  )
  register(channels.attemptsGet, attemptIdSchema, (attemptId) => attempts.get(attemptId))
  register(channels.attemptsTag, tagAttemptSchema, (input) => {
    mistakes.tagAttempt(input.attemptId, input.tagIds)
    return attempts.get(input.attemptId)
  })

  register(channels.mistakesList, noInputSchema, () => mistakes.list())

  register(channels.reviewQueue, noInputSchema, () => {
    const preferences = settings.get()
    const queue = review.listQueue({
      dueLimit: preferences.reviewDailyLimit,
      newLimit: preferences.newCardsPerDay,
    })
    const summaries = new Map(content.listProblems().map((problem) => [problem.id, problem]))
    const designs = new Map(content.listDesigns().map((design) => [design.id, design]))
    const toItem = (card: ReviewCard): ReviewQueueItem => {
      const summary = card.itemKind === 'problem' ? summaries.get(card.itemId) : undefined
      const design = card.itemKind === 'design' ? designs.get(card.itemId) : undefined

      return {
        ...card,
        title:
          summary?.title ??
          design?.title ??
          (card.itemKind === 'design' ? 'Design scenario' : card.itemId),
        subtitle: summary
          ? `${summary.difficulty} · ${summary.patterns.join(', ')}`
          : design
            ? `${design.difficulty} · ${design.tags.join(', ')}`
            : 'System design',
        previews: review.preview(card.id),
      }
    }

    return {
      due: queue.due.map(toItem),
      newCards: queue.newCards.map(toItem),
      totalDue: queue.totalDue,
      totalNew: queue.totalNew,
      dueLimit: preferences.reviewDailyLimit,
      newLimit: preferences.newCardsPerDay,
      reviewedToday: queue.reviewedToday,
      nextDueAt: queue.nextDueAt,
    }
  })

  register(channels.reviewPreview, cardIdSchema, (cardId) => review.preview(cardId))

  register(channels.reviewGrade, gradeReviewSchema, (input) => {
    const card = review.review(input.cardId, input.grade)
    return { card, previews: review.preview(card.id) }
  })

  register(channels.progressToday, noInputSchema, () => {
    const now = new Date()
    const counts = review.counts(now)
    const today = attempts.countSince(startOfLocalDay(now).toISOString())
    const active = new Set(attempts.activeDays().map((value) => localDayKey(new Date(value))))
    const stats = attempts.getStats()

    return {
      dueCount: counts.dueCount,
      newCount: counts.newCount,
      reviewedToday: counts.reviewedToday,
      attemptsToday: today.attempts,
      acceptedToday: today.accepted,
      streakDays: streakLength(active, now),
      lastAttemptAt: stats.lastAttemptAt,
      continueProblemId: attempts.latestProblemId(),
      dailyGoalMinutes: settings.get().dailyGoalMinutes,
    }
  })

  register(channels.progressProblems, noInputSchema, () => {
    const attemptProgress = new Map(
      attempts.getProblemProgress().map((item) => [item.problemId, item]),
    )
    const cards = new Map(review.listCards('problem').map((card) => [card.itemId, card]))

    return content.listProblems().map((problem) => {
      const item = attemptProgress.get(problem.id)
      const card = cards.get(problem.id)

      return {
        problemId: problem.id,
        attempts: item?.attempts ?? 0,
        accepted: item?.accepted ?? 0,
        reviewDueAt: card?.dueAt ?? null,
        reviewState: card?.state ?? null,
      }
    })
  })

  register(channels.progressSummary, noInputSchema, () => {
    const now = new Date()
    const stats = attempts.getStats()
    const counts = review.counts(now)
    const active = new Set(attempts.activeDays().map((value) => localDayKey(new Date(value))))
    const progress = new Map(attempts.getProblemProgress().map((item) => [item.problemId, item]))
    const patterns = new Map<string, { problems: number; attempted: number; accepted: number }>()
    const activityStart = new Date(now)
    activityStart.setDate(now.getDate() - 13)
    const activity = new Map<string, { attempts: number; accepted: number }>()

    for (const entry of attempts.recentActivity(startOfLocalDay(activityStart).toISOString())) {
      const key = localDayKey(new Date(entry.createdAt))
      const day = activity.get(key) ?? { attempts: 0, accepted: 0 }
      day.attempts += 1

      if (entry.status === 'accepted') {
        day.accepted += 1
      }

      activity.set(key, day)
    }

    const dailyActivity = Array.from({ length: 14 }, (_value, index) => {
      const cursor = new Date(now)
      cursor.setDate(now.getDate() - (13 - index))
      const day = localDayKey(cursor)
      const countsForDay = activity.get(day) ?? { attempts: 0, accepted: 0 }

      return { day, attempts: countsForDay.attempts, accepted: countsForDay.accepted }
    })

    for (const problem of content.listProblems()) {
      const item = progress.get(problem.id)

      for (const pattern of problem.patterns) {
        const entry = patterns.get(pattern) ?? { problems: 0, attempted: 0, accepted: 0 }
        entry.problems += 1

        if (item) {
          entry.attempted += 1

          if (item.accepted > 0) {
            entry.accepted += 1
          }
        }

        patterns.set(pattern, entry)
      }
    }

    return {
      attempts: stats.attempts,
      accepted: stats.accepted,
      lastAttemptAt: stats.lastAttemptAt,
      streakDays: streakLength(active, now),
      reviewsDue: counts.dueCount + counts.newCount,
      reviewsCompleted: counts.reviewsCompleted,
      reviewsCompletedToday: counts.reviewsCompletedToday,
      dailyActivity,
      patterns: [...patterns.entries()]
        .map(([pattern, value]) => ({ pattern, ...value }))
        .sort(
          (left, right) =>
            right.problems - left.problems || left.pattern.localeCompare(right.pattern),
        ),
      mistakes: mistakes.counts(),
      recentAttempts: attempts.listRecent(20),
    }
  })

  register(channels.notesGet, problemIdSchema, (problemId) => notes.get(problemId))
  register(channels.notesSave, problemNoteSchema, (input) =>
    notes.save(input.problemId, input.notes),
  )

  register(channels.designGetScene, noInputSchema, () => design.getScene())

  register(channels.designSaveScene, sceneJsonSchema, (sceneJson) => {
    design.saveScene(sceneJson)
  })

  register(channels.designListScenarios, noInputSchema, () => content.listDesigns())
  register(channels.designGetScenario, designScenarioIdSchema, (scenarioId) =>
    content.getDesign(scenarioId),
  )
  register(channels.designGetDraft, designScenarioIdSchema, (scenarioId) =>
    design.getDraft(scenarioId),
  )
  register(channels.designSaveDraft, saveDesignDraftSchema, (input) => design.saveDraft(input))
  register(channels.designSubmit, submitDesignSchema, (input) => {
    const attempt = design.submit(input)

    // The first submission creates a design review card. Grading stays manual so
    // the learner can reflect on the reference before scheduling the next review.
    review.ensureCard('design', input.scenarioId)

    return attempt
  })
  register(channels.designListAttempts, designScenarioIdSchema, (scenarioId) =>
    design.listAttempts(scenarioId),
  )
  register(channels.designGetAttempt, designAttemptIdSchema, (attemptId) =>
    design.getAttempt(attemptId),
  )

  register(channels.designExportAttempt, exportDesignAttemptSchema, async (input) => {
    const attempt = design.getAttempt(input.attemptId)
    const scenario = content.getDesign(attempt.scenarioId)
    const markdown = renderDesignAttemptMarkdown(scenario, attempt)
    const selection = await dialog.showSaveDialog({
      title: 'Export design attempt',
      defaultPath: `base-case-${scenario.slug}-${attempt.createdAt.slice(0, 10)}.md`,
      filters: [{ name: 'Markdown', extensions: ['md'] }],
    })

    if (selection.canceled || !selection.filePath) {
      return { saved: false }
    }

    await writeFile(selection.filePath, markdown, 'utf8')

    if (!input.pngDataUrl) {
      return { saved: true, path: selection.filePath }
    }

    const match = /^data:image\/png;base64,(.+)$/.exec(input.pngDataUrl)

    if (!match?.[1]) {
      throw new Error('Expected a base64 PNG data URL.')
    }

    const pngPath = `${selection.filePath.replace(/\.md$/i, '')}.png`
    await writeFile(pngPath, Buffer.from(match[1], 'base64'))

    return { saved: true, path: selection.filePath, pngPath }
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

  register(channels.aiTestConnection, noInputSchema, () => ai.testConnection())

  register(channels.aiPreview, aiRequestSchema, (request) => ai.preview(request))

  register(channels.aiRun, aiRequestSchema, (request, event) => {
    const requestId = randomUUID()

    void ai
      .run(request, requestId, (text) => {
        sendAiEvent(event.sender, { requestId, type: 'chunk', text })
      })
      .then((outcome) => {
        sendAiEvent(event.sender, {
          requestId,
          type: 'done',
          text: outcome.text,
          result: outcome.result,
          warning: outcome.warning,
        })
      })
      .catch((error: unknown) => {
        sendAiEvent(event.sender, {
          requestId,
          type: 'error',
          message: error instanceof Error ? error.message : String(error),
          code: error instanceof AiProviderError ? error.code : 'internal_error',
        })
      })

    return { requestId }
  })

  register(channels.aiCancel, requestIdSchema, (requestId) => ai.cancel(requestId))

  register(channels.aiFeedback, aiFeedbackSchema, (input) => ai.feedback(input))

  register(channels.settingsGet, noInputSchema, () => settings.get())
  register(channels.settingsUpdate, settingsPatchSchema, (patch) => settings.update(patch))

  register(channels.packsList, noInputSchema, () => content.listPacks())
  register(channels.packsPreview, packImportKindSchema, (kind) => packs.preview(kind))
  register(channels.packsInstall, packTokenSchema, (token) => packs.install(token))
  register(channels.packsUninstall, packIdSchema, (packId) => packs.uninstall(packId))

  register(channels.dataExport, noInputSchema, async () => {
    const selection = await dialog.showSaveDialog({
      title: 'Export Base Case data',
      defaultPath: `base-case-export-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })

    if (selection.canceled || !selection.filePath) {
      return { saved: false }
    }

    const { bundle, counts } = userData.export()
    await writeFile(selection.filePath, JSON.stringify(bundle, null, 2), 'utf8')
    return { saved: true, path: selection.filePath, counts }
  })

  register(channels.dataImport, noInputSchema, async () => {
    const selection = await dialog.showOpenDialog({
      title: 'Import Base Case data',
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })

    const path = selection.filePaths[0]

    if (selection.canceled || !path) {
      return { saved: false }
    }

    const raw = JSON.parse(await readFile(path, 'utf8')) as unknown
    const counts = userData.import(raw)
    return { saved: true, path, counts }
  })
}
