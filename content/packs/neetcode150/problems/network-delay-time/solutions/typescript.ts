class Solution {
  networkDelayTime(n: number, times: number[][], k: number): number {
    const graph: Array<Array<[number, number]>> = Array.from({ length: n + 1 }, () => [])
    for (const [source, destination, weight] of times) {
      graph[source].push([destination, weight])
    }

    const distance = new Array<number>(n + 1).fill(Number.POSITIVE_INFINITY)
    const visited = new Array<boolean>(n + 1).fill(false)
    distance[k] = 0

    for (let round = 0; round < n; round += 1) {
      let node = -1
      for (let candidate = 1; candidate <= n; candidate += 1) {
        if (!visited[candidate] && (node === -1 || distance[candidate] < distance[node])) {
          node = candidate
        }
      }

      if (node === -1 || !Number.isFinite(distance[node])) break
      visited[node] = true

      for (const [destination, weight] of graph[node]) {
        const candidate = distance[node] + weight
        if (candidate < distance[destination]) distance[destination] = candidate
      }
    }

    let answer = 0
    for (let node = 1; node <= n; node += 1) {
      if (!Number.isFinite(distance[node])) return -1
      if (distance[node] > answer) answer = distance[node]
    }
    return answer
  }
}

export { Solution }
