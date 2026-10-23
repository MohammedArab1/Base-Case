import { z } from 'zod'
import { describe, expect, it } from 'vitest'
import { AppError, toIpcError } from './ipc-errors'

describe('toIpcError', () => {
  it('keeps explicit application error codes', () => {
    expect(toIpcError(new AppError('not_found', 'Unknown problem'))).toEqual({
      code: 'not_found',
      message: 'Unknown problem',
    })
  })

  it('turns Zod failures into invalid_request with readable paths', () => {
    try {
      z.object({ problemId: z.string().min(1) }).parse({ problemId: '' })
    } catch (error) {
      const result = toIpcError(error)
      expect(result.code).toBe('invalid_request')
      expect(result.message).toContain('problemId')
    }
  })

  it('maps judge runtime failures to judge_unavailable', () => {
    const error = Object.assign(new Error('runtime missing'), { code: 'runtime_missing' })
    expect(toIpcError(error).code).toBe('judge_unavailable')
  })

  it('maps judge timeouts to timeout', () => {
    expect(toIpcError(new Error('Judge request timed out after 120000 ms.')).code).toBe('timeout')
  })

  it('falls back to internal_error without leaking unknown values', () => {
    expect(toIpcError('boom')).toEqual({
      code: 'internal_error',
      message: 'An unexpected error occurred.',
    })
  })
})
