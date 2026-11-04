class Solution {
  trieOperations(operations: string[], words: string[]): boolean[] {
    const children: Array<Map<string, number>> = [new Map()]
    const terminal: boolean[] = [false]
    const results: boolean[] = []

    const find = (word: string): number => {
      let node = 0
      for (const ch of word) {
        const nextNode = children[node].get(ch)
        if (nextNode === undefined) {
          return -1
        }
        node = nextNode
      }
      return node
    }

    for (let index = 0; index < operations.length; index += 1) {
      const operation = operations[index]
      const word = words[index]

      if (operation === 'insert') {
        let node = 0
        for (const ch of word) {
          let nextNode = children[node].get(ch)
          if (nextNode === undefined) {
            nextNode = children.length
            children[node].set(ch, nextNode)
            children.push(new Map())
            terminal.push(false)
          }
          node = nextNode
        }
        terminal[node] = true
        results.push(true)
      } else if (operation === 'search') {
        const node = find(word)
        results.push(node !== -1 && terminal[node])
      } else {
        results.push(find(word) !== -1)
      }
    }

    return results
  }
}

export { Solution }
