class Solution {
  canPartition(nums: number[]): boolean {
    const total = nums.reduce((sum, value) => sum + value, 0)

    if (total % 2 === 1) {
      return false
    }

    const target = Math.floor(total / 2)
    const reachable = new Array<boolean>(target + 1).fill(false)
    reachable[0] = true

    for (const value of nums) {
      for (let current = target; current >= value; current -= 1) {
        if (reachable[current - value]) {
          reachable[current] = true
        }
      }
    }

    return reachable[target]
  }
}

export { Solution }
