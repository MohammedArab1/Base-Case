class Solution {
  maxSkipping(values: number[]): number {
    let take = 0
    let skip = 0

    for (const value of values) {
      const nextTake = skip + value
      const nextSkip = Math.max(skip, take)
      take = nextTake
      skip = nextSkip
    }

    return Math.max(take, skip)
  }
}

export { Solution }
