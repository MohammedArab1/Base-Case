class Solution {
  countClusters(connected: number[][]): number {
    const size = connected.length
    const visited = new Array<boolean>(size).fill(false)
    let clusters = 0

    for (let start = 0; start < size; start += 1) {
      if (visited[start]) {
        continue
      }

      clusters += 1
      visited[start] = true
      const stack = [start]

      while (stack.length > 0) {
        const node = stack.pop() as number

        for (let neighbor = 0; neighbor < size; neighbor += 1) {
          if (connected[node][neighbor] === 1 && !visited[neighbor]) {
            visited[neighbor] = true
            stack.push(neighbor)
          }
        }
      }
    }

    return clusters
  }
}

export { Solution }
