class Solution {
  sortColors(nums: number[]): void {
    let low = 0
    let middle = 0
    let high = nums.length - 1

    while (middle <= high) {
      if (nums[middle] === 0) {
        const value = nums[low]
        nums[low] = nums[middle]
        nums[middle] = value
        low += 1
        middle += 1
      } else if (nums[middle] === 1) {
        middle += 1
      } else {
        const value = nums[high]
        nums[high] = nums[middle]
        nums[middle] = value
        high -= 1
      }
    }
  }
}

export { Solution }
