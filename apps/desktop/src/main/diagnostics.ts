import { constants } from 'node:fs'
import { access, mkdtemp, readFile, rm, statfs, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { DiagnosticCheck, DiagnosticsReport, JudgeStatus } from '../shared/types'
import type { AiService } from './ai'
import type { ContentRepository } from './content'
import type { AppDatabase } from './database'
import type { JudgeClient } from './judge'
import type { ContentIndexRepository } from './repositories/content-index'

const MIN_FREE_BYTES = 500 * 1024 * 1024

export interface DiagnosticsDependencies {
  readonly appVersion: string
  readonly platform: string
  readonly arch: string
  readonly database: Pick<AppDatabase, 'connection' | 'path'>
  readonly content: Pick<
    ContentRepository,
    'listProblems' | 'listDesigns' | 'listLessons' | 'listPacks'
  >
  readonly contentIndex: Pick<ContentIndexRepository, 'count'>
  readonly judge: Pick<JudgeClient, 'status'>
  readonly ai: Pick<AiService, 'getStatus'>
  readonly userDataPath: string
  readonly logsPath: string
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unit = 0

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }

  const digits = unit === 0 || value >= 10 ? 0 : 1
  return `${value.toFixed(digits)} ${units[unit]}`
}

function isLocalEndpoint(baseUrl: string): boolean {
  try {
    const hostname = new URL(baseUrl).hostname
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.local')
    )
  } catch {
    return false
  }
}

function databaseCheck(database: DiagnosticsDependencies['database']): DiagnosticCheck {
  try {
    const row = database.connection.prepare('PRAGMA quick_check').get() as
      Record<string, unknown> | undefined
    const result = String(Object.values(row ?? {})[0] ?? 'unknown')

    if (result !== 'ok') {
      return {
        id: 'database',
        label: 'Database',
        status: 'fail',
        detail: `SQLite quick_check reported: ${result}`,
        hint: 'Export your data if the app still opens, then restore from a backup in the user data folder.',
      }
    }

    const migrations = database.connection
      .prepare('SELECT COUNT(*) AS count FROM schema_migrations')
      .get() as { count?: number } | undefined

    return {
      id: 'database',
      label: 'Database',
      status: 'pass',
      detail: `SQLite quick_check passed; ${Number(migrations?.count ?? 0)} migrations applied.`,
    }
  } catch (error) {
    return {
      id: 'database',
      label: 'Database',
      status: 'fail',
      detail: messageOf(error),
      hint: 'Check that the user data folder is writable and not locked by another app.',
    }
  }
}

async function storageCheck(userDataPath: string): Promise<DiagnosticCheck> {
  try {
    const directory = await mkdtemp(join(userDataPath, 'diagnostics-'))

    try {
      const probePath = join(directory, 'probe.txt')
      await writeFile(probePath, 'base-case', 'utf8')
      const contents = await readFile(probePath, 'utf8')

      if (contents !== 'base-case') {
        throw new Error('The probe file did not read back correctly.')
      }
    } finally {
      await rm(directory, { recursive: true, force: true })
    }

    const stats = await statfs(userDataPath)
    const freeBytes = Number(stats.bavail) * Number(stats.bsize)

    if (freeBytes < MIN_FREE_BYTES) {
      return {
        id: 'storage',
        label: 'Storage',
        status: 'warn',
        detail: `The user data folder is writable, but only ${formatBytes(freeBytes)} is free.`,
        hint: 'Free disk space before importing packs or exporting large design scenes.',
      }
    }

    return {
      id: 'storage',
      label: 'Storage',
      status: 'pass',
      detail: `The user data folder is writable; ${formatBytes(freeBytes)} free.`,
    }
  } catch (error) {
    return {
      id: 'storage',
      label: 'Storage',
      status: 'fail',
      detail: messageOf(error),
      hint: 'Check folder permissions or move the app data folder to a writable disk.',
    }
  }
}

async function logsCheck(logsPath: string): Promise<DiagnosticCheck> {
  try {
    await access(join(logsPath, 'app.log'), constants.R_OK)
    return {
      id: 'logs',
      label: 'Logs',
      status: 'pass',
      detail: 'The application log is present and readable.',
    }
  } catch {
    return {
      id: 'logs',
      label: 'Logs',
      status: 'warn',
      detail: 'No application log was found yet.',
      hint: 'The log is created on the first run. Restart the app if this persists.',
    }
  }
}

function contentCheck(content: DiagnosticsDependencies['content']): DiagnosticCheck {
  try {
    const problems = content.listProblems()
    const designs = content.listDesigns()
    const lessons = content.listLessons()
    const packs = content.listPacks()

    if (problems.length === 0) {
      return {
        id: 'content',
        label: 'Content',
        status: 'fail',
        detail: 'No coding problems are loaded.',
        hint: 'Reinstall the app or check that the bundled content folder is present.',
      }
    }

    if (designs.length === 0) {
      return {
        id: 'content',
        label: 'Content',
        status: 'warn',
        detail: `${problems.length} coding problems loaded, but no design scenarios.`,
        hint: 'Reinstall the app if the System Design tab is empty.',
      }
    }

    return {
      id: 'content',
      label: 'Content',
      status: 'pass',
      detail: `${problems.length} coding problems, ${designs.length} design scenarios, and ${lessons.length} lessons across ${packs.length} pack(s).`,
    }
  } catch (error) {
    return {
      id: 'content',
      label: 'Content',
      status: 'fail',
      detail: messageOf(error),
      hint: 'Check the bundled content folder and any installed user packs.',
    }
  }
}

function searchIndexCheck(
  contentIndex: DiagnosticsDependencies['contentIndex'],
  problemCount: number,
): DiagnosticCheck {
  try {
    const indexed = contentIndex.count()

    if (indexed === problemCount) {
      return {
        id: 'search-index',
        label: 'Search index',
        status: 'pass',
        detail: `${indexed} problems are indexed for search.`,
      }
    }

    return {
      id: 'search-index',
      label: 'Search index',
      status: 'warn',
      detail: `${indexed} of ${problemCount} problems are indexed for search.`,
      hint: 'The index is rebuilt at startup. Restart the app if this persists.',
    }
  } catch (error) {
    return {
      id: 'search-index',
      label: 'Search index',
      status: 'fail',
      detail: messageOf(error),
      hint: 'Restart the app to rebuild the search index.',
    }
  }
}

async function judgeChecks(
  judge: DiagnosticsDependencies['judge'],
): Promise<{ judge: DiagnosticCheck; runtimes: DiagnosticCheck }> {
  let status: JudgeStatus | null = null
  let error: string | null = null

  try {
    status = await judge.status()

    if (!status.ok) {
      error = status.error ?? 'The judge sidecar did not respond.'
      status = null
    }
  } catch (caught) {
    error = messageOf(caught)
  }

  if (!status) {
    return {
      judge: {
        id: 'judge',
        label: 'Judge sidecar',
        status: 'fail',
        detail: error ?? 'The judge sidecar is unavailable.',
        hint: 'Development builds need pnpm judge:build. Reinstall the app if this is a release build.',
      },
      runtimes: {
        id: 'runtimes',
        label: 'Language runtimes',
        status: 'warn',
        detail: 'Skipped because the judge sidecar is unavailable.',
      },
    }
  }

  const runtimes = Object.values(status.runtimes ?? {})
  const unavailable = runtimes.filter((runtime) => !runtime.available)
  const available = runtimes.filter((runtime) => runtime.available)

  const runtimeCheck: DiagnosticCheck =
    runtimes.length === 0
      ? {
          id: 'runtimes',
          label: 'Language runtimes',
          status: 'warn',
          detail: 'The judge did not report any language runtimes.',
          hint: 'Reinstall the app or run pnpm runtimes:fetch in development.',
        }
      : unavailable.length === 0
        ? {
            id: 'runtimes',
            label: 'Language runtimes',
            status: 'pass',
            detail: runtimes
              .map(
                (runtime) => `${runtime.name} ${runtime.version} (${runtime.source ?? 'unknown'})`,
              )
              .join(', '),
          }
        : available.length === 0
          ? {
              id: 'runtimes',
              label: 'Language runtimes',
              status: 'fail',
              detail: `No runtimes are available: ${unavailable
                .map((runtime) => runtime.name)
                .join(', ')}.`,
              hint: 'Reinstall the app or run pnpm runtimes:fetch in development.',
            }
          : {
              id: 'runtimes',
              label: 'Language runtimes',
              status: 'warn',
              detail: `Unavailable: ${unavailable
                .map((runtime) => `${runtime.name}${runtime.error ? ` (${runtime.error})` : ''}`)
                .join(', ')}.`,
              hint: 'Only the affected language will fail to run.',
            }

  return {
    judge: {
      id: 'judge',
      label: 'Judge sidecar',
      status: 'pass',
      detail: `${status.name ?? 'judge'} ${status.version ?? ''} on ${status.os ?? 'unknown'}/${
        status.arch ?? 'unknown'
      }.`.trim(),
    },
    runtimes: runtimeCheck,
  }
}

function aiCheck(ai: DiagnosticsDependencies['ai']): DiagnosticCheck {
  try {
    const status = ai.getStatus()

    if (status.type === 'none') {
      return {
        id: 'ai',
        label: 'AI provider',
        status: 'pass',
        detail: 'AI is off. The app works fully without it.',
      }
    }

    if (status.type === 'mock') {
      return {
        id: 'ai',
        label: 'AI provider',
        status: 'pass',
        detail: 'Mock provider enabled; no network calls are made.',
      }
    }

    const local = isLocalEndpoint(status.baseUrl)

    if (status.hasKey || local) {
      return {
        id: 'ai',
        label: 'AI provider',
        status: 'pass',
        detail: `OpenAI-compatible provider configured${
          local ? ' at a local endpoint' : ' with a stored key'
        }.`,
      }
    }

    return {
      id: 'ai',
      label: 'AI provider',
      status: 'warn',
      detail: 'OpenAI-compatible provider configured without an API key.',
      hint: 'Add a key in Settings, or point the provider at a local endpoint such as Ollama.',
    }
  } catch (error) {
    return {
      id: 'ai',
      label: 'AI provider',
      status: 'warn',
      detail: messageOf(error),
      hint: 'Open Settings and re-save the AI configuration.',
    }
  }
}

/**
 * Runs the local-only self-test shown in Settings. It never contacts the
 * network: the AI check only inspects local configuration.
 */
export async function runDiagnostics(
  dependencies: DiagnosticsDependencies,
): Promise<DiagnosticsReport> {
  const content = contentCheck(dependencies.content)
  const problems = (() => {
    try {
      return dependencies.content.listProblems().length
    } catch {
      return 0
    }
  })()
  const { judge, runtimes } = await judgeChecks(dependencies.judge)
  const searchIndex =
    content.status === 'fail' && problems === 0
      ? {
          id: 'search-index',
          label: 'Search index',
          status: 'warn' as const,
          detail: 'Skipped because the content failed to load.',
        }
      : searchIndexCheck(dependencies.contentIndex, problems)

  const checks: DiagnosticCheck[] = [
    {
      id: 'app',
      label: 'Application',
      status: 'pass',
      detail: `${dependencies.appVersion} · ${dependencies.platform}/${dependencies.arch}`,
    },
    databaseCheck(dependencies.database),
    await storageCheck(dependencies.userDataPath),
    await logsCheck(dependencies.logsPath),
    content,
    searchIndex,
    judge,
    runtimes,
    aiCheck(dependencies.ai),
  ]

  return {
    generatedAt: new Date().toISOString(),
    appVersion: dependencies.appVersion,
    platform: dependencies.platform,
    arch: dependencies.arch,
    ok: checks.every((check) => check.status !== 'fail'),
    checks,
  }
}
