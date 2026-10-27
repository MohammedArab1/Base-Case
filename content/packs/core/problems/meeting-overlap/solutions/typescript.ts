class Solution {
  canAttendAll(intervals: number[][]): boolean {
    const ordered = [...intervals].sort((left, right) => left[0] - right[0])

    for (let index = 1; index < ordered.length; index += 1) {
      if (ordered[index][0] < ordered[index - 1][1]) {
        return false
      }
    }

    return true
  }
}

export { Solution }
