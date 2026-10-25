class Solution {
  mergeShifts(shifts: number[][]): number[][] {
    const ordered = [...shifts].sort((left, right) => left[0] - right[0] || left[1] - right[1])
    const merged: number[][] = []

    for (const [start, end] of ordered) {
      const current = merged.at(-1)

      if (!current || start > current[1]) {
        merged.push([start, end])
      } else if (end > current[1]) {
        current[1] = end
      }
    }

    return merged
  }
}

export { Solution }
