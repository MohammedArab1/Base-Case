function compareStrings(first: string, second: string): number {
  if (first < second) {
    return -1
  }
  if (first > second) {
    return 1
  }
  return 0
}

class Solution {
  groupAnagrams(words: string[]): string[][] {
    const groups = new Map<string, string[]>()

    for (const word of words) {
      const counts = new Array<number>(26).fill(0)

      for (const char of word) {
        counts[char.charCodeAt(0) - 97] += 1
      }

      const key = counts.join(',')
      const group = groups.get(key)

      if (group === undefined) {
        groups.set(key, [word])
      } else {
        group.push(word)
      }
    }

    const result = Array.from(groups.values(), (group) => group.sort(compareStrings))
    result.sort((first, second) => compareStrings(first[0], second[0]))
    return result
  }
}

export { Solution }
