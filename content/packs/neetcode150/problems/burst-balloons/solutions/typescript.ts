class Solution {
  maxCoins(nums: number[]): number {
    const values = [1, ...nums, 1]
    const size = values.length
    const dp = Array.from({ length: size }, () => new Array<number>(size).fill(0))

    for (let length = 2; length < size; length += 1) {
      for (let left = 0; left < size - length; left += 1) {
        const right = left + length
        let best = 0
        for (let last = left + 1; last < right; last += 1) {
          const coins =
            dp[left][last] + values[left] * values[last] * values[right] + dp[last][right]
          if (coins > best) best = coins
        }
        dp[left][right] = best
      }
    }

    return dp[0][size - 1]
  }
}

export { Solution }
