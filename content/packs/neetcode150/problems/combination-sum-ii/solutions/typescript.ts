class Solution {
  combinationSum2(candidates: number[], target: number): number[][] {
    const values = [...candidates].sort((a, b) => a - b)
    const result: number[][] = []
    const path: number[] = []

    const explore = (start: number, remaining: number): void => {
      if (remaining === 0) {
        result.push([...path])
        return
      }

      for (let index = start; index < values.length; index += 1) {
        if (index > start && values[index] === values[index - 1]) {
          continue
        }
        if (values[index] > remaining) {
          break
        }
        path.push(values[index])
        explore(index + 1, remaining - values[index])
        path.pop()
      }
    }

    explore(0, target)
    return result
  }
}

export { Solution }
