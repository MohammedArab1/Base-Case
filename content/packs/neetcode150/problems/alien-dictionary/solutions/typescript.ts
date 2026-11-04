class Solution {
  alienOrder(words: string[]): string {
    const present = new Array<boolean>(26).fill(false)
    for (const word of words) {
      for (const character of word) {
        present[character.charCodeAt(0) - 97] = true
      }
    }

    const graph: Array<Set<number>> = Array.from({ length: 26 }, () => new Set())
    const indegree = new Array<number>(26).fill(0)

    for (let index = 0; index + 1 < words.length; index += 1) {
      const first = words[index]
      const second = words[index + 1]
      const limit = Math.min(first.length, second.length)
      let position = 0
      while (position < limit && first[position] === second[position]) {
        position += 1
      }

      if (position === limit) {
        if (first.length > second.length) return ''
        continue
      }

      const before = first.charCodeAt(position) - 97
      const after = second.charCodeAt(position) - 97
      if (!graph[before].has(after)) {
        graph[before].add(after)
        indegree[after] += 1
      }
    }

    let count = 0
    for (let letter = 0; letter < 26; letter += 1) {
      if (present[letter]) count += 1
    }

    const used = new Array<boolean>(26).fill(false)
    let result = ''

    while (result.length < count) {
      let chosen = -1
      for (let letter = 0; letter < 26; letter += 1) {
        if (present[letter] && !used[letter] && indegree[letter] === 0) {
          chosen = letter
          break
        }
      }

      if (chosen === -1) return ''
      used[chosen] = true
      result += String.fromCharCode(97 + chosen)

      for (const after of graph[chosen]) {
        indegree[after] -= 1
      }
    }

    return result
  }
}

export { Solution }
