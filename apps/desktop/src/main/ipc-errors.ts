import { ZodError } from 'zod'
import type { IpcError, IpcErrorCode } from '../shared/ipc'

export class AppError extends Error {
  constructor(
    readonly code: IpcErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

function describeZodError(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
      return `${path}${issue.message}`
    })
    .join('; ')
}

export function toIpcError(error: unknown): IpcError {
  if (error instanceof AppError) {
    return { code: error.code, message: error.message }
  }

  if (error instanceof ZodError) {
    return { code: 'invalid_request', message: describeZodError(error) }
  }

  if (error instanceof Error) {
    const message = error.message
    const judgeCode = (error as Error & { code?: unknown }).code

    if (typeof judgeCode === 'string') {
      if (judgeCode === 'runtime_missing') {
        return { code: 'judge_unavailable', message }
      }

      if (judgeCode === 'invalid_request' || judgeCode === 'invalid_params') {
        return { code: 'invalid_request', message }
      }
    }

    if (/timed out/i.test(message)) {
      return { code: 'timeout', message }
    }

    if (/Judge sidecar|judge is not running|failed to start/i.test(message)) {
      return { code: 'judge_unavailable', message }
    }

    if (/^Unknown problem/i.test(message)) {
      return { code: 'not_found', message }
    }

    return { code: 'internal_error', message }
  }

  return { code: 'internal_error', message: 'An unexpected error occurred.' }
}
