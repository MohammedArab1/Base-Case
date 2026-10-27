class Solution {
  permutations(nums: number[]): number[][] {
    const ordered = [...nums].sort((left, right) => left - right)
    const result: number[][] = []
    const path: number[] = []
    const used = new Array<boolean>(ordered.length).fill(false)

    const backtrack = (): void => {
      if (path.length === ordered.length) {
        result.push([...path])
        return
      }

      for (let index = 0; index < ordered.length; index += 1) {
        if (used[index]) {
          continue
        }

        used[index] = true
        path.push(ordered[index])
        backtrack()
        path.pop()
        used[index] = false
      }
    }

    backtrack()
    return result
  }
}

export { Solution }
