class Solution {
  countIslands(grid: number[][]): number {
    if (grid.length === 0 || grid[0].length === 0) {
      return 0
    }

    grid = grid.map((current) => [...current])
    const rows = grid.length
    const cols = grid[0].length
    let count = 0

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if (grid[row][col] !== 1) {
          continue
        }

        count += 1
        const stack: Array<[number, number]> = [[row, col]]

        while (stack.length > 0) {
          const cell = stack.pop()

          if (!cell) {
            continue
          }

          const [currentRow, currentCol] = cell

          if (
            currentRow < 0 ||
            currentRow >= rows ||
            currentCol < 0 ||
            currentCol >= cols ||
            grid[currentRow][currentCol] !== 1
          ) {
            continue
          }

          grid[currentRow][currentCol] = 0
          stack.push([currentRow + 1, currentCol])
          stack.push([currentRow - 1, currentCol])
          stack.push([currentRow, currentCol + 1])
          stack.push([currentRow, currentCol - 1])
        }
      }
    }

    return count
  }
}

export { Solution }
