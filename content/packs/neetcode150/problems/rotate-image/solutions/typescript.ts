class Solution {
  rotateQuarter(matrix: number[][]): number[][] {
    const size = matrix.length
    const result: number[][] = Array.from({ length: size }, () => new Array<number>(size).fill(0))

    for (let row = 0; row < size; row += 1) {
      for (let column = 0; column < size; column += 1) {
        result[column][size - 1 - row] = matrix[row][column]
      }
    }

    return result
  }
}

export { Solution }
