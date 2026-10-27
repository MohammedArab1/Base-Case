class Solution {
  wordBreak(text: string, words: string[]): boolean {
    const dictionary = new Set(words)
    const maximum = words.reduce((best, word) => Math.max(best, word.length), 0)
    const reachable = new Array<boolean>(text.length + 1).fill(false)
    reachable[0] = true

    for (let end = 1; end <= text.length; end += 1) {
      const start = Math.max(0, end - maximum)

      for (let index = start; index < end; index += 1) {
        if (reachable[index] && dictionary.has(text.slice(index, end))) {
          reachable[end] = true
          break
        }
      }
    }

    return reachable[text.length]
  }
}

export { Solution }
