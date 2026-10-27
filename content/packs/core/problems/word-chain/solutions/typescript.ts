class Solution {
  ladderLength(begin: string, end: string, words: string[]): number {
    if (!words.includes(end)) {
      return 0
    }
    if (begin === end) {
      return 1
    }

    const available = new Set(words)
    available.delete(begin)
    const queue: Array<[string, number]> = [[begin, 1]]

    for (let head = 0; head < queue.length; head += 1) {
      const [word, distance] = queue[head]

      for (let index = 0; index < word.length; index += 1) {
        for (let code = 97; code <= 122; code += 1) {
          const candidate = word.slice(0, index) + String.fromCharCode(code) + word.slice(index + 1)

          if (candidate === end) {
            return distance + 1
          }

          if (available.has(candidate)) {
            available.delete(candidate)
            queue.push([candidate, distance + 1])
          }
        }
      }
    }

    return 0
  }
}

export { Solution }
