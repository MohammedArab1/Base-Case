class Solution {
  threeSum(nums: number[]): number[][] {
    nums = [...nums]
    nums.sort((left, right) => left - right)
    const result: number[][] = []

    for (let index = 0; index + 2 < nums.length; index += 1) {
      if (index > 0 && nums[index] === nums[index - 1]) {
        continue
      }

      let left = index + 1
      let right = nums.length - 1

      while (left < right) {
        const total = nums[index] + nums[left] + nums[right]

        if (total < 0) {
          left += 1
        } else if (total > 0) {
          right -= 1
        } else {
          result.push([nums[index], nums[left], nums[right]])
          left += 1
          right -= 1

          while (left < right && nums[left] === nums[left - 1]) {
            left += 1
          }
          while (left < right && nums[right] === nums[right + 1]) {
            right -= 1
          }
        }
      }
    }

    return result
  }
}

export { Solution }
