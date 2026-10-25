class Solution {
  minCapacity(weights: number[], days: number): number {
    const shipsNeeded = (capacity: number): number => {
      let ships = 1
      let load = 0

      for (const weight of weights) {
        if (load + weight > capacity) {
          ships += 1
          load = weight
        } else {
          load += weight
        }
      }

      return ships
    }

    let low = Math.max(...weights)
    let high = weights.reduce((total, weight) => total + weight, 0)

    while (low < high) {
      const middle = low + Math.floor((high - low) / 2)

      if (shipsNeeded(middle) <= days) {
        high = middle
      } else {
        low = middle + 1
      }
    }

    return low
  }
}

export { Solution }
