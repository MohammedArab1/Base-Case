class Solution {
  isTallyMatch(first: string, second: string): boolean {
    if (first.length !== second.length) {
      return false
    }

    const counts = new Map<string, number>()

    for (const letter of first) {
      counts.set(letter, (counts.get(letter) ?? 0) + 1)
    }

    for (const letter of second) {
      const next = (counts.get(letter) ?? 0) - 1

      if (next < 0) {
        return false
      }

      counts.set(letter, next)
    }

    return true
  }
}

export { Solution }
