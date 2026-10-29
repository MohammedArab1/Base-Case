class Solution {
  rottenMinutes(grid: number[][]): number {
    grid = grid.map((row) => [...row])
    const rows = grid.length
    const columns = grid[0].length
    const queue: Array<[number, number]> = []
    let fresh = 0

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < columns; c += 1) {
        if (grid[r][c] === 1) {
          fresh += 1
        } else if (grid[r][c] === 2) {
          queue.push([r, c])
        }
      }
    }

    let minutes = 0
    let head = 0

    while (head < queue.length && fresh > 0) {
      const waveSize = queue.length - head

      for (let index = 0; index < waveSize; index += 1) {
        const [r, c] = queue[head] as [number, number]
        head += 1
        const neighbors: Array<[number, number]> = [
          [r + 1, c],
          [r - 1, c],
          [r, c + 1],
          [r, c - 1],
        ]

        for (const [nr, nc] of neighbors) {
          if (nr >= 0 && nr < rows && nc >= 0 && nc < columns && grid[nr][nc] === 1) {
            grid[nr][nc] = 2
            fresh -= 1
            queue.push([nr, nc])
          }
        }
      }

      minutes += 1
    }

    return fresh === 0 ? minutes : -1
  }
}

export { Solution }
