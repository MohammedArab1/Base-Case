class Solution {
  findMinHeightTrees(n: number, edges: number[][]): number[] {
    if (n === 1) {
      return [0]
    }

    const neighbors = Array.from({ length: n }, () => new Set<number>())

    for (const [first, second] of edges) {
      neighbors[first].add(second)
      neighbors[second].add(first)
    }

    const leaves: number[] = []

    for (let node = 0; node < n; node += 1) {
      if (neighbors[node].size === 1) {
        leaves.push(node)
      }
    }

    let head = 0
    let remaining = n

    while (remaining > 2) {
      const layer = leaves.length - head
      remaining -= layer

      for (let index = 0; index < layer; index += 1) {
        const leaf = leaves[head]
        head += 1

        for (const neighbor of neighbors[leaf]) {
          neighbors[neighbor].delete(leaf)

          if (neighbors[neighbor].size === 1) {
            leaves.push(neighbor)
          }
        }
      }
    }

    return leaves.slice(head).sort((left, right) => left - right)
  }
}

export { Solution }
