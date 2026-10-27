class Solution {
  insertInterval(intervals: number[][], incoming: number[]): number[][] {
    const result: number[][] = []
    let index = 0

    while (index < intervals.length && intervals[index][1] < incoming[0]) {
      result.push(intervals[index])
      index += 1
    }

    let start = incoming[0]
    let end = incoming[1]

    while (index < intervals.length && intervals[index][0] <= end) {
      start = Math.min(start, intervals[index][0])
      end = Math.max(end, intervals[index][1])
      index += 1
    }

    result.push([start, end])

    while (index < intervals.length) {
      result.push(intervals[index])
      index += 1
    }

    return result
  }
}

export { Solution }
