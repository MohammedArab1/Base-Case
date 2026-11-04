class Solution {
  isValidSudoku(board: string[][]): boolean {
    const rows: Array<Set<string>> = Array.from({ length: 9 }, () => new Set<string>())
    const columns: Array<Set<string>> = Array.from({ length: 9 }, () => new Set<string>())
    const boxes: Array<Set<string>> = Array.from({ length: 9 }, () => new Set<string>())

    for (let row = 0; row < 9; row += 1) {
      for (let column = 0; column < 9; column += 1) {
        const value = board[row][column]
        if (value === '.') {
          continue
        }

        const box = Math.floor(row / 3) * 3 + Math.floor(column / 3)
        if (rows[row].has(value) || columns[column].has(value) || boxes[box].has(value)) {
          return false
        }

        rows[row].add(value)
        columns[column].add(value)
        boxes[box].add(value)
      }
    }

    return true
  }
}

export { Solution }
