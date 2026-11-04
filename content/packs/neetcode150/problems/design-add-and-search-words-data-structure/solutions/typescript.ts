class Solution {
  dictionaryOperations(operations: string[], words: string[]): boolean[] {
    const children: Array<Map<string, number>> = [new Map()]
    const terminal: boolean[] = [false]
    const results: boolean[] = []

    const matches = (word: string, position: number, node: number): boolean => {
      if (position === word.length) {
        return terminal[node]
      }

      const ch = word[position]

      if (ch === '.') {
        for (const child of children[node].values()) {
          if (matches(word, position + 1, child)) {
            return true
          }
        }
        return false
      }

      const child = children[node].get(ch)
      return child !== undefined && matches(word, position + 1, child)
    }

    for (let index = 0; index < operations.length; index += 1) {
      const operation = operations[index]
      const word = words[index]

      if (operation === 'addWord') {
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
      } else {
        results.push(matches(word, 0, 0))
      }
    }

    return results
  }
}

export { Solution }
