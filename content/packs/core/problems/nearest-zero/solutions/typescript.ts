class Solution {
  nearestZero(grid: number[][]): number[][] {
    const rows = grid.length
    const columns = grid[0].length
    const distance = Array.from({ length: rows }, () => new Array<number>(columns).fill(-1))
    const queue: Array<[number, number]> = []

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < columns; c += 1) {
        if (grid[r][c] === 0) {
          distance[r][c] = 0
          queue.push([r, c])
        }
      }
    }

    for (let head = 0; head < queue.length; head += 1) {
      const [r, c] = queue[head]
      const neighbors: Array<[number, number]> = [
        [r + 1, c],
        [r - 1, c],
        [r, c + 1],
        [r, c - 1],
      ]

      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < rows && nc >= 0 && nc < columns && distance[nr][nc] === -1) {
          distance[nr][nc] = distance[r][c] + 1
          queue.push([nr, nc])
        }
      }
    }

    return distance
  }
}

export { Solution }
