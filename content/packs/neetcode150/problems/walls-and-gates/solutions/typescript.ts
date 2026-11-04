class Solution {
  wallsAndGates(rooms: number[][]): number[][] {
    if (rooms.length === 0 || rooms[0].length === 0) {
      return []
    }

    const inf = 2147483647
    const rows = rooms.length
    const cols = rooms[0].length
    const grid = rooms.map((row) => [...row])
    const queue: Array<[number, number]> = []
    let head = 0

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if (grid[row][col] === 0) {
          queue.push([row, col])
        }
      }
    }

    while (head < queue.length) {
      const current = queue[head]
      head += 1
      const [row, col] = current
      const candidates: Array<[number, number]> = [
        [row + 1, col],
        [row - 1, col],
        [row, col + 1],
        [row, col - 1],
      ]

      for (const [nextRow, nextCol] of candidates) {
        if (
          nextRow >= 0 &&
          nextRow < rows &&
          nextCol >= 0 &&
          nextCol < cols &&
          grid[nextRow][nextCol] === inf
        ) {
          grid[nextRow][nextCol] = grid[row][col] + 1
          queue.push([nextRow, nextCol])
        }
      }
    }

    return grid
  }
}

export { Solution }
