class Solution {
  findWords(board: string[][], words: string[]): string[] {
    if (board.length === 0 || board[0].length === 0) {
      return []
    }

    const children: Array<Map<string, number>> = [new Map()]
    const terminal: Array<string | null> = [null]

    for (const word of words) {
      let node = 0
      for (const ch of word) {
        let nextNode = children[node].get(ch)
        if (nextNode === undefined) {
          nextNode = children.length
          children[node].set(ch, nextNode)
          children.push(new Map())
          terminal.push(null)
        }
        node = nextNode
      }
      terminal[node] = word
    }

    const rows = board.length
    const cols = board[0].length
    const grid = board.map((row) => [...row])
    const found = new Set<string>()

    const visit = (row: number, col: number, node: number): void => {
      const ch = grid[row][col]
      const nextNode = children[node].get(ch)
      if (nextNode === undefined) {
        return
      }

      const word = terminal[nextNode]
      if (word !== null) {
        found.add(word)
      }

      grid[row][col] = '#'
      const directions: Array<[number, number]> = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]

      for (const [dr, dc] of directions) {
        const nextRow = row + dr
        const nextCol = col + dc
        if (
          nextRow >= 0 &&
          nextRow < rows &&
          nextCol >= 0 &&
          nextCol < cols &&
          grid[nextRow][nextCol] !== '#'
        ) {
          visit(nextRow, nextCol, nextNode)
        }
      }

      grid[row][col] = ch
    }

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        visit(row, col, 0)
      }
    }

    return [...found].sort()
  }
}

export { Solution }
