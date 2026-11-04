class Solution {
  countCoinCombinations(amount: number, coins: number[]): number {
    const ways = new Array<number>(amount + 1).fill(0)
    ways[0] = 1

    for (const coin of coins) {
      for (let value = coin; value <= amount; value += 1) {
        ways[value] += ways[value - coin]
      }
    }

    return ways[amount]
  }
}

export { Solution }
