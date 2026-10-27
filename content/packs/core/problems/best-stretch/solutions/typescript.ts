class Solution {
  maxStretch(nums: number[]): number {
    let ending = nums[0]
    let best = nums[0]

    for (let index = 1; index < nums.length; index += 1) {
      ending = Math.max(nums[index], ending + nums[index])
      best = Math.max(best, ending)
    }

    return best
  }
}

export { Solution }
