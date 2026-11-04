class Solution {
  longestIncreasingPath(matrix: number[][]): number {
    const rows = matrix.length
    const columns = matrix[0].length
    const cells: Array<[number, number, number]> = []

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        cells.push([matrix[row][column], row, column])
      }
    }
    cells.sort((left, right) => left[0] - right[0])

    const best = Array.from({ length: rows }, () => new Array<number>(columns).fill(1))
    const directions: Array<[number, number]> = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]
    let answer = 0

    for (const [, row, column] of cells) {
      for (const [deltaRow, deltaColumn] of directions) {
        const nextRow = row + deltaRow
        const nextColumn = column + deltaColumn
        if (
          nextRow >= 0 &&
          nextRow < rows &&
          nextColumn >= 0 &&
          nextColumn < columns &&
          matrix[nextRow][nextColumn] < matrix[row][column]
        ) {
          const candidate = best[nextRow][nextColumn] + 1
          if (candidate > best[row][column]) best[row][column] = candidate
        }
      }
      if (best[row][column] > answer) answer = best[row][column]
    }

    return answer
  }
}

export { Solution }
