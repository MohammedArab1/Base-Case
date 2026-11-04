class Solution {
  maxRestProfit(prices: number[]): number {
    let resting = 0
    let holding = Number.NEGATIVE_INFINITY
    let cooling = Number.NEGATIVE_INFINITY

    for (const price of prices) {
      const previousHolding = holding
      const previousResting = resting
      const previousCooling = cooling

      holding = Math.max(previousHolding, previousResting - price)
      cooling = previousHolding + price
      resting = Math.max(previousResting, previousCooling)
    }

    return Math.max(resting, cooling)
  }
}

export { Solution }
