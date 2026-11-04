class Solution {
  subsetsWithDup(nums: number[]): number[][] {
    const values = [...nums].sort((a, b) => a - b)
    const result: number[][] = []
    const path: number[] = []

    const explore = (start: number): void => {
      result.push([...path])
      for (let index = start; index < values.length; index += 1) {
        if (index > start && values[index] === values[index - 1]) {
          continue
        }
        path.push(values[index])
        explore(index + 1)
        path.pop()
      }
    }

    explore(0)
    return result
  }
}

export { Solution }
