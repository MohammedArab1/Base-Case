class Solution {
  maxProfit(prices: number[]): number {
    let cheapest = Number.POSITIVE_INFINITY
    let best = 0

    for (const price of prices) {
      best = Math.max(best, price - cheapest)
      cheapest = Math.min(cheapest, price)
    }

    return best
  }
}

export { Solution }
