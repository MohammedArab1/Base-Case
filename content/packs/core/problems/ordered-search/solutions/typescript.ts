class Solution {
  searchIndex(nums: number[], target: number): number {
    let low = 0
    let high = nums.length

    while (low < high) {
      const middle = low + Math.floor((high - low) / 2)

      if (nums[middle] === target) {
        return middle
      }
      if (nums[middle] < target) {
        low = middle + 1
      } else {
        high = middle
      }
    }

    return -1
  }
}

export { Solution }
