class Solution {
  subsets(nums: number[]): number[][] {
    const values = [...nums].sort((left, right) => left - right)
    const result: number[][] = []
    const path: number[] = []

    const backtrack = (start: number): void => {
      result.push([...path])

      for (let index = start; index < values.length; index += 1) {
        path.push(values[index])
        backtrack(index + 1)
        path.pop()
      }
    }

    backtrack(0)
    result.sort((left, right) => {
      if (left.length !== right.length) {
        return left.length - right.length
      }

      for (let index = 0; index < left.length; index += 1) {
        if (left[index] !== right[index]) {
          return left[index] - right[index]
        }
      }

      return 0
    })

    return result
  }
}

export { Solution }
