class Solution {
  longestConsecutive(nums: number[]): number {
    const values = new Set(nums)
    let best = 0

    for (const value of values) {
      if (values.has(value - 1)) {
        continue
      }

      let length = 1
      while (values.has(value + length)) {
        length += 1
      }

      best = Math.max(best, length)
    }

    return best
  }
}

export { Solution }
