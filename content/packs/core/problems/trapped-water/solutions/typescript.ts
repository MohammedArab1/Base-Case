class Solution {
  trapWater(heights: number[]): number {
    let left = 0
    let right = heights.length - 1
    let leftMax = 0
    let rightMax = 0
    let water = 0

    while (left < right) {
      if (heights[left] < heights[right]) {
        leftMax = Math.max(leftMax, heights[left])
        water += leftMax - heights[left]
        left += 1
      } else {
        rightMax = Math.max(rightMax, heights[right])
        water += rightMax - heights[right]
        right -= 1
      }
    }

    return water
  }
}

export { Solution }
