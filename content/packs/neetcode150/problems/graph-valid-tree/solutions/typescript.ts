class Solution {
  validTree(n: number, edges: number[][]): boolean {
    if (edges.length !== n - 1) {
      return false
    }

    const parent: number[] = []
    const size: number[] = []
    for (let node = 0; node < n; node += 1) {
      parent.push(node)
      size.push(1)
    }

    const find = (node: number): number => {
      while (parent[node] !== node) {
        parent[node] = parent[parent[node]]
        node = parent[node]
      }
      return node
    }

    for (const [first, second] of edges) {
      let rootFirst = find(first)
      let rootSecond = find(second)

      if (rootFirst === rootSecond) {
        return false
      }

      if (size[rootFirst] < size[rootSecond]) {
        const swap = rootFirst
        rootFirst = rootSecond
        rootSecond = swap
      }

      parent[rootSecond] = rootFirst
      size[rootFirst] += size[rootSecond]
    }

    return true
  }
}

export { Solution }
