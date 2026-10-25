class Solution {
  countRanges(weights: number[], target: number): number {
    const counts = new Map<number, number>()
    counts.set(0, 1)

    let running = 0
    let answer = 0

    for (const value of weights) {
      running += value
      answer += counts.get(running - target) ?? 0
      counts.set(running, (counts.get(running) ?? 0) + 1)
    }

    return answer
  }
}

export { Solution }
