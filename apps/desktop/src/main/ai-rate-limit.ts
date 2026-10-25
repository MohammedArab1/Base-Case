/**
 * Sliding-window limiter for user-initiated AI calls. It is deliberately
 * in-memory: restarting the app clears it, which is fine for a local tool.
 */
export class RateLimiter {
  private timestamps: number[] = []

  constructor(
    private readonly maxRequests = 8,
    private readonly windowMs = 60_000,
    private readonly now: () => number = () => Date.now(),
  ) {}

  acquire(): boolean {
    const now = this.now()
    this.timestamps = this.timestamps.filter((timestamp) => now - timestamp < this.windowMs)

    if (this.timestamps.length >= this.maxRequests) {
      return false
    }

    this.timestamps.push(now)
    return true
  }

  reset(): void {
    this.timestamps = []
  }
}
