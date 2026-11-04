class Solution {
  minRemovals(intervals: number[][]): number {
    const ordered = [...intervals].sort((left, right) => left[1] - right[1])
    let kept = 0
    let lastEnd = Number.NEGATIVE_INFINITY

    for (const [start, end] of ordered) {
      if (start >= lastEnd) {
        kept += 1
        lastEnd = end
      }
    }

    return intervals.length - kept
  }
}

export { Solution }
