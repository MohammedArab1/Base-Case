class Solution {
  minRooms(intervals: number[][]): number {
    if (intervals.length === 0) {
      return 0
    }

    const starts = intervals.map((interval) => interval[0]).sort((a, b) => a - b)
    const ends = intervals.map((interval) => interval[1]).sort((a, b) => a - b)

    let rooms = 0
    let endIndex = 0

    for (const start of starts) {
      if (endIndex < ends.length && ends[endIndex] <= start) {
        endIndex += 1
      } else {
        rooms += 1
      }
    }

    return rooms
  }
}

export { Solution }
