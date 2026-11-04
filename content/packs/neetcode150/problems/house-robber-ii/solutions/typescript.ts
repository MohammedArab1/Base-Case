class Solution {
  maxCircularLoot(values: number[]): number {
    if (values.length === 1) {
      return values[0]
    }

    return Math.max(
      this.bestRange(values, 0, values.length - 1),
      this.bestRange(values, 1, values.length),
    )
  }

  private bestRange(values: number[], start: number, end: number): number {
    let take = 0
    let skip = 0

    for (let index = start; index < end; index += 1) {
      const nextTake = skip + values[index]
      const nextSkip = Math.max(skip, take)
      take = nextTake
      skip = nextSkip
    }

    return Math.max(take, skip)
  }
}

export { Solution }
