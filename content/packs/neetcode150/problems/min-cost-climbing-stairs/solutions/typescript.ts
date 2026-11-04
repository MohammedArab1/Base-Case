class Solution {
  minAscentCost(cost: number[]): number {
    let twoBack = 0
    let oneBack = 0

    for (let position = 2; position <= cost.length; position += 1) {
      const current = Math.min(oneBack + cost[position - 1], twoBack + cost[position - 2])
      twoBack = oneBack
      oneBack = current
    }

    return oneBack
  }
}

export { Solution }
