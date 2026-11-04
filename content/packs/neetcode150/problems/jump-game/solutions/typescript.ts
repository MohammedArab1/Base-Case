class Solution {
  canReach(steps: number[]): boolean {
    let farthest = 0
    const last = steps.length - 1

    for (let index = 0; index < steps.length; index += 1) {
      if (index > farthest) {
        return false
      }

      farthest = Math.max(farthest, index + steps[index])

      if (farthest >= last) {
        return true
      }
    }

    return true
  }
}

export { Solution }
