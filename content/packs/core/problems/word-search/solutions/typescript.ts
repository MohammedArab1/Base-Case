class Solution {
  exists(board: string[], word: string): boolean {
    const rows = board.length
    const columns = board[0].length
    const grid = board.map((row) => row.split(''))

    const search = (row: number, column: number, index: number): boolean => {
      if (index === word.length) {
        return true
      }

      if (row < 0 || row >= rows || column < 0 || column >= columns) {
        return false
      }

      if (grid[row][column] !== word[index]) {
        return false
      }

      const saved = grid[row][column]
      grid[row][column] = '#'

      const found =
        search(row + 1, column, index + 1) ||
        search(row - 1, column, index + 1) ||
        search(row, column + 1, index + 1) ||
        search(row, column - 1, index + 1)

      grid[row][column] = saved
      return found
    }

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        if (search(row, column, 0)) {
          return true
        }
      }
    }

    return false
  }
}

export { Solution }
