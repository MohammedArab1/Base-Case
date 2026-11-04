class Solution {
  captureRegions(board: string[][]): string[][] {
    if (board.length === 0 || board[0].length === 0) {
      return []
    }

    const rows = board.length
    const cols = board[0].length
    const grid = board.map((row) => [...row])
    const safe: boolean[][] = Array.from({ length: rows }, () => Array<boolean>(cols).fill(false))
    const stack: Array<[number, number]> = []

    const seed = (row: number, col: number): void => {
      if (grid[row][col] === 'O' && !safe[row][col]) {
        safe[row][col] = true
        stack.push([row, col])
      }
    }

    for (let row = 0; row < rows; row += 1) {
      seed(row, 0)
      seed(row, cols - 1)
    }

    for (let col = 0; col < cols; col += 1) {
      seed(0, col)
      seed(rows - 1, col)
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
          grid[nextRow][nextCol] === 'O' &&
          !safe[nextRow][nextCol]
        ) {
          safe[nextRow][nextCol] = true
          stack.push([nextRow, nextCol])
        }
      }
    }

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if (grid[row][col] === 'O' && !safe[row][col]) {
          grid[row][col] = 'X'
        }
      }
    }

    return grid
  }
}

export { Solution }
