class Solution {
  maxAreaOfIsland(grid: number[][]): number {
    if (grid.length === 0 || grid[0].length === 0) {
      return 0
    }

    const rows = grid.length
    const cols = grid[0].length
    const cells = grid.map((row) => [...row])
    let best = 0

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if (cells[row][col] !== 1) {
          continue
        }

        cells[row][col] = 0
        const stack: Array<[number, number]> = [[row, col]]
        let area = 0

        while (stack.length > 0) {
          const current = stack.pop() as [number, number]
          const [currentRow, currentCol] = current
          area += 1

          const neighbors: Array<[number, number]> = [
            [currentRow + 1, currentCol],
            [currentRow - 1, currentCol],
            [currentRow, currentCol + 1],
            [currentRow, currentCol - 1],
          ]

          for (const [nextRow, nextCol] of neighbors) {
            if (
              nextRow >= 0 &&
              nextRow < rows &&
              nextCol >= 0 &&
              nextCol < cols &&
              cells[nextRow][nextCol] === 1
            ) {
              cells[nextRow][nextCol] = 0
              stack.push([nextRow, nextCol])
            }
          }
        }

        best = Math.max(best, area)
      }
    }

    return best
  }
}

export { Solution }
