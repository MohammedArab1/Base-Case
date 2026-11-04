class Solution {
  missingValue(labels: number[]): number {
    let result = labels.length

    for (let index = 0; index < labels.length; index += 1) {
      result ^= index
      result ^= labels[index]
    }

    return result
  }
}

export { Solution }
