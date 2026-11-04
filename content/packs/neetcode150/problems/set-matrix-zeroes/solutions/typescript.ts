class Solution {
  zeroMatrix(matrix: number[][]): number[][] {
    const rows = matrix.length
    const columns = matrix[0].length
    const zeroRows = new Set<number>()
    const zeroColumns = new Set<number>()

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        if (matrix[row][column] === 0) {
          zeroRows.add(row)
          zeroColumns.add(column)
        }
      }
    }

    const result: number[][] = Array.from({ length: rows }, () =>
      new Array<number>(columns).fill(0),
    )

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        if (!zeroRows.has(row) && !zeroColumns.has(column)) {
          result[row][column] = matrix[row][column]
        }
      }
    }

    return result
  }
}

export { Solution }
