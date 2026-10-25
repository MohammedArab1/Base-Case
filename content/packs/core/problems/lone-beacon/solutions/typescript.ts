class Solution {
  loneBeacon(signals: number[]): number {
    let result = 0

    for (const value of signals) {
      result ^= value
    }

    return result
  }
}

export { Solution }
