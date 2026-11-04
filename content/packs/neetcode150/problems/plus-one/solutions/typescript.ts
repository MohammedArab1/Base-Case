class Solution {
  increment(digits: number[]): number[] {
    const result = [...digits]

    for (let index = result.length - 1; index >= 0; index -= 1) {
      if (result[index] < 9) {
        result[index] += 1
        return result
      }

      result[index] = 0
    }

    return [1, ...result]
  }
}

export { Solution }
