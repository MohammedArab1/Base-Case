class Solution {
  canCompose(note: string, source: string): boolean {
    if (note.length > source.length) {
      return false
    }

    const counts = new Array<number>(26).fill(0)

    for (const letter of source) {
      counts[letter.charCodeAt(0) - 97] += 1
    }

    for (const letter of note) {
      const index = letter.charCodeAt(0) - 97

      if (counts[index] === 0) {
        return false
      }

      counts[index] -= 1
    }

    return true
  }
}

export { Solution }
