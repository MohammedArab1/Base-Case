class Solution {
  minCostConnectPoints(points: number[][]): number {
    const n = points.length
    if (n <= 1) return 0

    const visited = new Array<boolean>(n).fill(false)
    const best = new Array<number>(n).fill(Number.POSITIVE_INFINITY)
    best[0] = 0
    let total = 0

    for (let round = 0; round < n; round += 1) {
      let current = -1
      for (let index = 0; index < n; index += 1) {
        if (!visited[index] && (current === -1 || best[index] < best[current])) {
          current = index
        }
      }

      visited[current] = true
      total += best[current]
      const [x, y] = points[current]

      for (let other = 0; other < n; other += 1) {
        if (!visited[other]) {
          const distance = Math.abs(x - points[other][0]) + Math.abs(y - points[other][1])
          if (distance < best[other]) best[other] = distance
        }
      }
    }

    return total
  }
}

export { Solution }
