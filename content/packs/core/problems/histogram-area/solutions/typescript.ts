class Solution {
  largestRectangle(heights: number[]): number {
    const stack: number[] = []
    let best = 0

    for (let index = 0; index <= heights.length; index += 1) {
      const height = index < heights.length ? heights[index] : 0

      while (stack.length > 0 && heights[stack[stack.length - 1]] > height) {
        const bar = stack.pop() as number
        const width = stack.length === 0 ? index : index - stack[stack.length - 1] - 1
        best = Math.max(best, heights[bar] * width)
      }

      if (index < heights.length) {
        stack.push(index)
      }
    }

    return best
  }
}

export { Solution }
