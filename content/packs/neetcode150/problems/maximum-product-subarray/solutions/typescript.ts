class Solution {
  maxProductStretch(values: number[]): number {
    let best = values[0]
    let highest = values[0]
    let lowest = values[0]

    for (let index = 1; index < values.length; index += 1) {
      const value = values[index]
      const candidates = [value, highest * value, lowest * value]
      highest = Math.max(...candidates)
      lowest = Math.min(...candidates)
      best = Math.max(best, highest)
    }

    return best
  }
}

export { Solution }
