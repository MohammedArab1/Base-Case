class Solution {
  spiralOrder(grid: number[][]): number[] {
    if (grid.length === 0 || grid[0].length === 0) {
      return []
    }

    let top = 0
    let bottom = grid.length - 1
    let left = 0
    let right = grid[0].length - 1
    const result: number[] = []

    while (top <= bottom && left <= right) {
      for (let column = left; column <= right; column += 1) {
        result.push(grid[top][column])
      }
      top += 1

      for (let row = top; row <= bottom; row += 1) {
        result.push(grid[row][right])
      }
      right -= 1

      if (top <= bottom) {
        for (let column = right; column >= left; column -= 1) {
          result.push(grid[bottom][column])
        }
        bottom -= 1
      }

      if (left <= right) {
        for (let row = bottom; row >= top; row -= 1) {
          result.push(grid[row][left])
        }
        left += 1
      }
    }

    return result
  }
}

export { Solution }
