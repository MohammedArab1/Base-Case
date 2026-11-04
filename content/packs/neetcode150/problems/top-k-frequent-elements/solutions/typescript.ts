class Solution {
  topKFrequent(nums: number[], k: number): number[] {
    const counts = new Map<number, number>()

    for (const value of nums) {
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }

    const ranked = Array.from(counts.entries())
    ranked.sort((first, second) => {
      if (first[1] !== second[1]) {
        return second[1] - first[1]
      }
      return first[0] - second[0]
    })

    const chosen = ranked.slice(0, k).map(([value]) => value)
    chosen.sort((first, second) => first - second)
    return chosen
  }
}

export { Solution }
