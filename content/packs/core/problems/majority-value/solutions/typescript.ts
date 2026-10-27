class Solution {
  majorityValue(nums: number[]): number {
    let candidate = nums[0]
    let count = 0

    for (const value of nums) {
      if (count === 0) {
        candidate = value
      }

      count += value === candidate ? 1 : -1
    }

    return candidate
  }
}

export { Solution }
