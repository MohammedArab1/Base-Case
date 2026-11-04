class Solution {
  findCheapestPrice(n: number, flights: number[][], src: number, dst: number, k: number): number {
    const infinity = Number.POSITIVE_INFINITY
    let distance = new Array<number>(n).fill(infinity)
    distance[src] = 0

    for (let round = 0; round <= k; round += 1) {
      const nextDistance = distance.slice()
      for (const [origin, destination, price] of flights) {
        if (!Number.isFinite(distance[origin])) continue
        const candidate = distance[origin] + price
        if (candidate < nextDistance[destination]) {
          nextDistance[destination] = candidate
        }
      }
      distance = nextDistance
    }

    return Number.isFinite(distance[dst]) ? distance[dst] : -1
  }
}

export { Solution }
