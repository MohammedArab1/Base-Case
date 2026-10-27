class Solution {
  coinChange(coins: number[], amount: number): number {
    const impossible = amount + 1
    const dp = new Array<number>(amount + 1).fill(impossible)
    dp[0] = 0

    for (let value = 1; value <= amount; value += 1) {
      for (const coin of coins) {
        if (coin <= value) {
          dp[value] = Math.min(dp[value], dp[value - coin] + 1)
        }
      }
    }

    return dp[amount] === impossible ? -1 : dp[amount]
  }
}

export { Solution }
