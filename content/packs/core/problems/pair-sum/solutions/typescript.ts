class Solution {
  pairSum(nums: number[], target: number): number[] {
    const seen = new Map<number, number>()

    for (let index = 0; index < nums.length; index += 1) {
      const value = nums[index]
      const complement = target - value
      const first = seen.get(complement)

      if (first !== undefined) {
        return first < index ? [first, index] : [index, first]
      }

      seen.set(value, index)
    }

    return []
  }
}

export { Solution }
