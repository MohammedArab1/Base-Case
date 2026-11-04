class GraphNode {
  value: number
  neighbors: GraphNode[]

  constructor(value: number) {
    this.value = value
    this.neighbors = []
  }
}

class Solution {
  cloneGraph(adjacency: number[][]): number[][] {
    const count = adjacency.length
    if (count === 0) {
      return []
    }

    const originals: GraphNode[] = []
    for (let index = 0; index < count; index += 1) {
      originals.push(new GraphNode(index + 1))
    }

    for (let index = 0; index < count; index += 1) {
      for (const neighbor of adjacency[index]) {
        originals[index].neighbors.push(originals[neighbor - 1])
      }
    }

    const copies = new Map<number, GraphNode>()

    const clone = (node: GraphNode): GraphNode => {
      const existing = copies.get(node.value)
      if (existing !== undefined) {
        return existing
      }

      const copied = new GraphNode(node.value)
      copies.set(node.value, copied)
      for (const neighbor of node.neighbors) {
        copied.neighbors.push(clone(neighbor))
      }
      return copied
    }

    for (const node of originals) {
      clone(node)
    }

    const result: number[][] = []
    for (let label = 1; label <= count; label += 1) {
      const copied = copies.get(label) as GraphNode
      result.push(copied.neighbors.map((neighbor) => neighbor.value).sort((a, b) => a - b))
    }
    return result
  }
}

export { Solution }
