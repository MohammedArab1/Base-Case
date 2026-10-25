import { describe, expect, it } from 'vitest'
import { RateLimiter } from './ai-rate-limit'

describe('RateLimiter', () => {
  it('allows requests up to the limit, then rejects', () => {
    let now = 0
    const limiter = new RateLimiter(2, 1000, () => now)

    expect(limiter.acquire()).toBe(true)
    expect(limiter.acquire()).toBe(true)
    expect(limiter.acquire()).toBe(false)

    now = 1001
    expect(limiter.acquire()).toBe(true)
  })

  it('reset clears the window', () => {
    const limiter = new RateLimiter(1, 1000, () => 0)
    expect(limiter.acquire()).toBe(true)
    expect(limiter.acquire()).toBe(false)
    limiter.reset()
    expect(limiter.acquire()).toBe(true)
  })
})
