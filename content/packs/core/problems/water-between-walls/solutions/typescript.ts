class Solution {
  maxWater(heights: number[]): number {
    let left = 0
    let right = heights.length - 1
    let best = 0

    while (left < right) {
      const width = right - left
      const height = Math.min(heights[left], heights[right])
      best = Math.max(best, width * height)

      if (heights[left] <= heights[right]) {
        left += 1
      } else {
        right -= 1
      }
    }

    return best
  }
}

export { Solution }
