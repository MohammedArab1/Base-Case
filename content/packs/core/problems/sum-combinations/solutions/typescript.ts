class Solution {
  combinationSum(candidates: number[], target: number): number[][] {
    candidates = [...candidates].sort((left, right) => left - right)
    const result: number[][] = []
    const path: number[] = []

    const backtrack = (start: number, remaining: number): void => {
      if (remaining === 0) {
        result.push([...path])
        return
      }

      for (let index = start; index < candidates.length; index += 1) {
        const value = candidates[index]

        if (value > remaining) {
          break
        }

        path.push(value)
        backtrack(index, remaining - value)
        path.pop()
      }
    }

    backtrack(0, target)
    return result
  }
}

export { Solution }
