class Solution {
  countSquares(points: number[][], queries: number[][]): number[] {
    const occupied = new Set<string>()

    for (const [x, y] of points) {
      occupied.add(`${x},${y}`)
    }

    const answers: number[] = []

    for (const [x, y, side] of queries) {
      if (!occupied.has(`${x},${y}`)) {
        answers.push(0)
        continue
      }

      let count = 0

      for (const dx of [-side, side]) {
        for (const dy of [-side, side]) {
          const corners = [
            [x, y],
            [x + dx, y],
            [x, y + dy],
            [x + dx, y + dy],
          ]

          if (corners.every(([cornerX, cornerY]) => occupied.has(`${cornerX},${cornerY}`))) {
            count += 1
          }
        }
      }

      answers.push(count)
    }

    return answers
  }
}

export { Solution }
