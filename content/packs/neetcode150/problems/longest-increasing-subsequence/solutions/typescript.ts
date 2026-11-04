class Solution {
  longestUphillRun(values: number[]): number {
    const tails: number[] = []

    for (const value of values) {
      let low = 0
      let high = tails.length

      while (low < high) {
        const middle = Math.floor((low + high) / 2)
        if (tails[middle] < value) {
          low = middle + 1
        } else {
          high = middle
        }
      }

      if (low === tails.length) {
        tails.push(value)
      } else {
        tails[low] = value
      }
    }

    return tails.length
  }
}

export { Solution }
