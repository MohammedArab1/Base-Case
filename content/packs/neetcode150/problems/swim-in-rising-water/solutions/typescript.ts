class Solution {
  swimInWater(grid: number[][]): number {
    const n = grid.length
    const directions: Array<[number, number]> = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]

    const canReach = (limit: number): boolean => {
      if (grid[0][0] > limit) return false
      const visited = Array.from({ length: n }, () => new Array<boolean>(n).fill(false))
      const queue: Array<[number, number]> = [[0, 0]]
      visited[0][0] = true
      let head = 0

      while (head < queue.length) {
        const [row, column] = queue[head]
        head += 1
        if (row === n - 1 && column === n - 1) return true

        for (const [deltaRow, deltaColumn] of directions) {
          const nextRow = row + deltaRow
          const nextColumn = column + deltaColumn
          if (
            nextRow >= 0 &&
            nextRow < n &&
            nextColumn >= 0 &&
            nextColumn < n &&
            !visited[nextRow][nextColumn] &&
            grid[nextRow][nextColumn] <= limit
          ) {
            visited[nextRow][nextColumn] = true
            queue.push([nextRow, nextColumn])
          }
        }
      }

      return false
    }

    let low = grid[0][0]
    let high = grid[0][0]
    for (const row of grid) {
      for (const value of row) {
        if (value > high) high = value
      }
    }

    while (low < high) {
      const middle = Math.floor((low + high) / 2)
      if (canReach(middle)) high = middle
      else low = middle + 1
    }

    return low
  }
}

export { Solution }
