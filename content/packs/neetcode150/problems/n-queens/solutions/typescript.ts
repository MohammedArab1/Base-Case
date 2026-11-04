class Solution {
  totalNQueens(n: number): number {
    if (n <= 0) {
      return 0
    }

    const fullMask = (1 << n) - 1

    const count = (
      row: number,
      columns: number,
      diagonalDown: number,
      diagonalUp: number,
    ): number => {
      if (row === n) {
        return 1
      }

      let available = fullMask & ~(columns | diagonalDown | diagonalUp)
      let total = 0

      while (available !== 0) {
        const bit = available & -available
        available -= bit
        total += count(row + 1, columns | bit, (diagonalDown | bit) << 1, (diagonalUp | bit) >> 1)
      }

      return total
    }

    return count(0, 0, 0, 0)
  }
}

export { Solution }
