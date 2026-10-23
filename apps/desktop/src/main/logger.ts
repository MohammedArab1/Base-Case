import { appendFileSync, existsSync, mkdirSync, renameSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LoggerOptions {
  readonly directory: string
  readonly maxBytes?: number
  readonly maxFiles?: number
  readonly level?: LogLevel
}

interface LogSink {
  write(level: LogLevel, line: string): void
}

const defaultMaxBytes = 2 * 1024 * 1024
const defaultMaxFiles = 5
const levelRank: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 }
const sensitiveKey = /^(api_?key|authorization|password|secret|token)$/i

export function redactForLog(value: unknown, depth = 0): unknown {
  if (depth > 4) {
    return '[truncated]'
  }

  if (typeof value === 'string') {
    return value.length > 2000 ? `${value.slice(0, 2000)}…` : value
  }

  if (Array.isArray(value)) {
    const items = value.slice(0, 50).map((item) => redactForLog(item, depth + 1))
    return value.length > items.length
      ? [...items, `[+${value.length - items.length} more]`]
      : items
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {}

    for (const [key, item] of Object.entries(value)) {
      result[key] = sensitiveKey.test(key) ? '[redacted]' : redactForLog(item, depth + 1)
    }

    return result
  }

  return value
}

class FileSink implements LogSink {
  private readonly directory: string
  private readonly path: string
  private readonly maxBytes: number
  private readonly maxFiles: number

  constructor(directory: string, maxBytes: number, maxFiles: number) {
    mkdirSync(directory, { recursive: true })
    this.directory = directory
    this.path = join(directory, 'app.log')
    this.maxBytes = maxBytes
    this.maxFiles = maxFiles
  }

  write(_level: LogLevel, line: string): void {
    this.rotateIfNeeded()

    try {
      appendFileSync(this.path, `${line}\n`, 'utf8')
    } catch {
      // Logging must never take the app down.
    }
  }

  private rotateIfNeeded(): void {
    try {
      if (!existsSync(this.path) || statSync(this.path).size < this.maxBytes) {
        return
      }
    } catch {
      return
    }

    try {
      rmSync(join(this.directory, `app.${this.maxFiles}.log`), { force: true })

      for (let index = this.maxFiles - 1; index >= 1; index -= 1) {
        const source = join(this.directory, `app.${index}.log`)

        if (existsSync(source)) {
          renameSync(source, join(this.directory, `app.${index + 1}.log`))
        }
      }

      renameSync(this.path, join(this.directory, 'app.1.log'))
    } catch {
      // If rotation fails, keep appending to the current file.
    }
  }
}

class ConsoleSink implements LogSink {
  write(level: LogLevel, line: string): void {
    const method = level === 'debug' ? 'log' : level
    console[method](line)
  }
}

export class Logger {
  private constructor(
    private readonly sink: LogSink,
    private readonly scope = '',
    private readonly minimumLevel: LogLevel = 'debug',
  ) {}

  static file(options: LoggerOptions): Logger {
    return new Logger(
      new FileSink(
        options.directory,
        options.maxBytes ?? defaultMaxBytes,
        options.maxFiles ?? defaultMaxFiles,
      ),
      '',
      options.level ?? 'info',
    )
  }

  static console(): Logger {
    return new Logger(new ConsoleSink())
  }

  child(scope: string): Logger {
    if (!scope) {
      return this
    }

    return new Logger(this.sink, this.scope ? `${this.scope}.${scope}` : scope, this.minimumLevel)
  }

  debug(event: string, data?: Record<string, unknown>): void {
    this.log('debug', event, data)
  }

  info(event: string, data?: Record<string, unknown>): void {
    this.log('info', event, data)
  }

  warn(event: string, data?: Record<string, unknown>): void {
    this.log('warn', event, data)
  }

  error(event: string, data?: Record<string, unknown>): void {
    this.log('error', event, data)
  }

  private log(level: LogLevel, event: string, data?: Record<string, unknown>): void {
    if (levelRank[level] < levelRank[this.minimumLevel]) {
      return
    }

    const record = {
      ...(data ? (redactForLog(data) as Record<string, unknown>) : {}),
      time: new Date().toISOString(),
      level,
      ...(this.scope ? { scope: this.scope } : {}),
      event,
    }

    let line: string

    try {
      line = JSON.stringify(record)
    } catch {
      line = JSON.stringify({ time: record.time, level, scope: record.scope, event })
    }

    this.sink.write(level, line)
  }
}

let active: Logger | null = null
const fallback = Logger.console()

export function configureLogger(options: LoggerOptions): Logger {
  const requested = options.level ?? process.env.BASE_CASE_LOG_LEVEL
  const level: LogLevel =
    requested === 'debug' || requested === 'info' || requested === 'warn' || requested === 'error'
      ? requested
      : 'info'

  active = Logger.file({ ...options, level })
  return active
}

export function getLogger(scope?: string): Logger {
  return (active ?? fallback).child(scope ?? '')
}
