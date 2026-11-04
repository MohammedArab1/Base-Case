class Solution {
  characterReplacement(s: string, k: number): number {
    const counts = new Array<number>(26).fill(0)
    let left = 0
    let best = 0

    for (let right = 0; right < s.length; right += 1) {
      counts[s.charCodeAt(right) - 97] += 1

      while (this.maxCount(counts) < right - left + 1 - k) {
        counts[s.charCodeAt(left) - 97] -= 1
        left += 1
      }

      best = Math.max(best, right - left + 1)
    }

    return best
  }

  private maxCount(counts: number[]): number {
    let largest = 0
    for (const count of counts) {
      largest = Math.max(largest, count)
    }
    return largest
  }
}

export { Solution }
