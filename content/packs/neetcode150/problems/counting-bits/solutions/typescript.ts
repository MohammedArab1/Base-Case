class Solution {
  bitCounts(n: number): number[] {
    const counts = new Array<number>(n + 1).fill(0)

    for (let value = 1; value <= n; value += 1) {
      counts[value] = counts[value >> 1] + (value & 1)
    }

    return counts
  }
}

export { Solution }
