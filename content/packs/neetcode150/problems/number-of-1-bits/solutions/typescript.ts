class Solution {
  setBitCount(value: number): number {
    let count = 0

    while (value !== 0) {
      value &= value - 1
      count += 1
    }

    return count
  }
}

export { Solution }
