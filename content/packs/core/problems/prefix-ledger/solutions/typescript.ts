interface TrieNode {
  count: number
  children: Map<string, TrieNode>
}

function makeNode(): TrieNode {
  return { count: 0, children: new Map() }
}

class Solution {
  prefixCounts(words: string[], queries: string[]): number[] {
    const root = makeNode()

    for (const word of words) {
      let node = root
      node.count += 1

      for (const character of word) {
        let child = node.children.get(character)

        if (!child) {
          child = makeNode()
          node.children.set(character, child)
        }

        node = child
        node.count += 1
      }
    }

    return queries.map((query) => {
      let node = root

      for (const character of query) {
        const child = node.children.get(character)

        if (!child) {
          return 0
        }

        node = child
      }

      return node.count
    })
  }
}

export { Solution }
