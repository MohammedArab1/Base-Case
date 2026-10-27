class Solution {
  findAnagrams(source: string, pattern: string): number[] {
    if (pattern.length > source.length) {
      return []
    }

    const need = new Array<number>(26).fill(0)
    const window = new Array<number>(26).fill(0)

    for (const letter of pattern) {
      need[letter.charCodeAt(0) - 97] += 1
    }

    const result: number[] = []

    for (let index = 0; index < source.length; index += 1) {
      window[source.charCodeAt(index) - 97] += 1

      if (index >= pattern.length) {
        window[source.charCodeAt(index - pattern.length) - 97] -= 1
      }

      if (index >= pattern.length - 1 && window.every((count, letter) => count === need[letter])) {
        result.push(index - pattern.length + 1)
      }
    }

    return result
  }
}

export { Solution }
