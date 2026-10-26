import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { formatDiagnosticsReport } from '../shared/diagnostics'
import { AppDatabase } from './database'
import { runDiagnostics, type DiagnosticsDependencies } from './diagnostics'

let directory: string
let database: AppDatabase
let logsPath: string

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'base-case-diagnostics-'))
  database = new AppDatabase(directory)
  logsPath = join(directory, 'logs')
  mkdirSync(logsPath, { recursive: true })
  writeFileSync(join(logsPath, 'app.log'), 'app.start\n')
})

afterEach(() => {
  database.close()
  rmSync(directory, { recursive: true, force: true })
})

function dependencies(overrides: Partial<DiagnosticsDependencies> = {}): DiagnosticsDependencies {
  const content = {
    listProblems: () => [{ id: 'core/a' }, { id: 'core/b' }],
    listDesigns: () => [{ id: 'core/design' }],
    listPacks: () => [{ id: 'core' }],
  } as unknown as DiagnosticsDependencies['content']

  return {
    appVersion: '0.1.0-alpha',
    platform: 'test',
    arch: 'test',
    database,
    content,
    contentIndex: { count: () => 2 },
    judge: {
      status: async () => ({
        ok: true,
        name: 'base-case-judge',
        version: '0.1.0',
        os: 'test',
        arch: 'test',
        runtimes: {
          python: {
            name: 'python',
            path: '/runtimes/python',
            source: 'bundled',
            version: '3.12.15',
            available: true,
          },
          node: {
            name: 'node',
            path: '/runtimes/node',
            source: 'bundled',
            version: '24.22.0',
            available: true,
          },
        },
      }),
    },
    ai: {
      getStatus: () => ({
        type: 'none',
        baseUrl: '',
        model: '',
        contextWindow: 32768,
        headers: {},
        enabled: false,
        hasKey: false,
      }),
    },
    userDataPath: directory,
    logsPath,
    ...overrides,
  }
}

describe('runDiagnostics', () => {
  it('passes when every local dependency is healthy', async () => {
    const report = await runDiagnostics(dependencies())
    const byId = new Map(report.checks.map((check) => [check.id, check]))

    expect(report.ok).toBe(true)
    expect(report.appVersion).toBe('0.1.0-alpha')
    expect(byId.get('database')?.status).toBe('pass')
    expect(byId.get('content')?.detail).toContain('2 coding problems and 1 design scenarios')
    expect(byId.get('search-index')?.status).toBe('pass')
    expect(byId.get('judge')?.status).toBe('pass')
    expect(byId.get('runtimes')?.status).toBe('pass')
    expect(byId.get('logs')?.status).toBe('pass')
    expect(byId.get('ai')?.status).toBe('pass')
  })

  it('reports judge, index, and AI problems without failing the whole app', async () => {
    const report = await runDiagnostics(
      dependencies({
        contentIndex: { count: () => 1 },
        judge: {
          status: async () => ({
            ok: false,
            error: 'judge binary is missing',
          }),
        },
        ai: {
          getStatus: () => ({
            type: 'openai-compatible',
            baseUrl: 'https://api.example.com/v1',
            model: 'test',
            contextWindow: 32768,
            headers: {},
            enabled: true,
            hasKey: false,
          }),
        },
      }),
    )
    const byId = new Map(report.checks.map((check) => [check.id, check]))

    expect(report.ok).toBe(false)
    expect(byId.get('judge')?.status).toBe('fail')
    expect(byId.get('judge')?.detail).toContain('judge binary is missing')
    expect(byId.get('runtimes')?.status).toBe('warn')
    expect(byId.get('search-index')?.status).toBe('warn')
    expect(byId.get('ai')?.status).toBe('warn')
    expect(byId.get('content')?.status).toBe('pass')
  })

  it('accepts a local AI endpoint without a key', async () => {
    const report = await runDiagnostics(
      dependencies({
        ai: {
          getStatus: () => ({
            type: 'openai-compatible',
            baseUrl: 'http://localhost:11434/v1',
            model: 'llama',
            contextWindow: 8192,
            headers: {},
            enabled: true,
            hasKey: false,
          }),
        },
      }),
    )
    const ai = report.checks.find((check) => check.id === 'ai')

    expect(ai?.status).toBe('pass')
    expect(ai?.detail).toContain('local endpoint')
  })
})

describe('formatDiagnosticsReport', () => {
  it('includes statuses and next steps', async () => {
    const report = await runDiagnostics(
      dependencies({
        judge: { status: async () => ({ ok: false, error: 'missing' }) },
      }),
    )
    const text = formatDiagnosticsReport(report)

    expect(text).toContain('Base Case diagnostics')
    expect(text).toContain('FAIL  Judge sidecar')
    expect(text).toContain('Next steps:')
    expect(text).toContain('Judge sidecar:')
    expect(text.endsWith('\n')).toBe(true)
  })
})
