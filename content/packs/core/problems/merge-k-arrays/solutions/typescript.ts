class Solution {
  mergeK(arrays: number[][]): number[] {
    if (arrays.length === 0) {
      return []
    }

    let working = arrays.map((array) => [...array])

    const mergeTwo = (first: number[], second: number[]): number[] => {
      const result: number[] = []
      let left = 0
      let right = 0

      while (left < first.length && right < second.length) {
        if (first[left] <= second[right]) {
          result.push(first[left])
          left += 1
        } else {
          result.push(second[right])
          right += 1
        }
      }

      while (left < first.length) {
        result.push(first[left])
        left += 1
      }

      while (right < second.length) {
        result.push(second[right])
        right += 1
      }

      return result
    }

    while (working.length > 1) {
      const nextRound: number[][] = []

      for (let index = 0; index < working.length - 1; index += 2) {
        nextRound.push(mergeTwo(working[index], working[index + 1]))
      }

      if (working.length % 2 === 1) {
        nextRound.push(working[working.length - 1])
      }

      working = nextRound
    }

    return working[0]
  }
}

export { Solution }
