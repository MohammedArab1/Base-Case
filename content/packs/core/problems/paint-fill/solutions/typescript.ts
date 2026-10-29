class Solution {
  floodFill(image: number[][], row: number, column: number, color: number): number[][] {
    image = image.map((current) => [...current])
    const old = image[row][column]

    if (old === color) {
      return image
    }

    const rows = image.length
    const columns = image[0].length
    image[row][column] = color
    const stack: Array<[number, number]> = [[row, column]]

    while (stack.length > 0) {
      const [r, c] = stack.pop() as [number, number]
      const neighbors: Array<[number, number]> = [
        [r + 1, c],
        [r - 1, c],
        [r, c + 1],
        [r, c - 1],
      ]

      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < rows && nc >= 0 && nc < columns && image[nr][nc] === old) {
          image[nr][nc] = color
          stack.push([nr, nc])
        }
      }
    }

    return image
  }
}

export { Solution }
