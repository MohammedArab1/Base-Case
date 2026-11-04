class Solution {
  minEatingRate(piles: number[], hours: number): number {
    let low = 1
    let high = 0
    for (const pile of piles) {
      high = Math.max(high, pile)
    }

    const hoursNeeded = (rate: number): number => {
      let total = 0
      for (const pile of piles) {
        total += Math.ceil(pile / rate)
      }
      return total
    }

    while (low < high) {
      const mid = Math.floor((low + high) / 2)
      if (hoursNeeded(mid) <= hours) {
        high = mid
      } else {
        low = mid + 1
      }
    }

    return low
  }
}

export { Solution }
