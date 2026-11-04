class Solution {
  pacificAtlantic(heights: number[][]): number[][] {
    if (heights.length === 0 || heights[0].length === 0) {
      return []
    }

    const rows = heights.length
    const cols = heights[0].length

    const reachable = (starts: Array<[number, number]>): boolean[][] => {
      const seen: boolean[][] = Array.from({ length: rows }, () => Array<boolean>(cols).fill(false))
      const stack: Array<[number, number]> = []

      for (const [row, col] of starts) {
        if (!seen[row][col]) {
          seen[row][col] = true
          stack.push([row, col])
        }
      }

      while (stack.length > 0) {
        const current = stack.pop() as [number, number]
        const [row, col] = current
        const candidates: Array<[number, number]> = [
          [row + 1, col],
          [row - 1, col],
          [row, col + 1],
          [row, col - 1],
        ]

        for (const [nextRow, nextCol] of candidates) {
          if (
            nextRow >= 0 &&
            nextRow < rows &&
            nextCol >= 0 &&
            nextCol < cols &&
            !seen[nextRow][nextCol] &&
            heights[nextRow][nextCol] >= heights[row][col]
          ) {
            seen[nextRow][nextCol] = true
            stack.push([nextRow, nextCol])
          }
        }
      }

      return seen
    }

    const pacificStarts: Array<[number, number]> = []
    for (let col = 0; col < cols; col += 1) {
      pacificStarts.push([0, col])
    }
    const atlanticStarts: Array<[number, number]> = []
    for (let col = 0; col < cols; col += 1) {
      atlanticStarts.push([rows - 1, col])
    }
    for (let row = 0; row < rows; row += 1) {
      pacificStarts.push([row, 0])
      atlanticStarts.push([row, cols - 1])
    }

    const pacific = reachable(pacificStarts)
    const atlantic = reachable(atlanticStarts)
    const result: number[][] = []

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if (pacific[row][col] && atlantic[row][col]) {
          result.push([row, col])
        }
      }
    }

    return result
  }
}

export { Solution }
