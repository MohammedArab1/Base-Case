class Solution {
  startingStation(gas: number[], cost: number[]): number {
    let total = 0
    let balance = 0
    let candidate = 0

    for (let index = 0; index < gas.length; index += 1) {
      const difference = gas[index] - cost[index]
      total += difference
      balance += difference

      if (balance < 0) {
        candidate = index + 1
        balance = 0
      }
    }

    return total >= 0 && candidate < gas.length ? candidate : -1
  }
}

export { Solution }
