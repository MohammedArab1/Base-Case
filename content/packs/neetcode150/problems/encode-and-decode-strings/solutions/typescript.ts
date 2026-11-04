class Solution {
  runCodec(operations: string[], arguments_: string[][]): string[][] {
    const results: string[][] = []

    for (let index = 0; index < operations.length; index += 1) {
      if (operations[index] === 'encode') {
        results.push([this.encodeWords(arguments_[index])])
      } else {
        results.push(this.decodeWords(arguments_[index][0]))
      }
    }

    return results
  }

  private encodeWords(words: string[]): string {
    let result = ''
    for (const word of words) {
      result += `${word.length}#${word}`
    }
    return result
  }

  private decodeWords(encoded: string): string[] {
    const words: string[] = []
    let index = 0

    while (index < encoded.length) {
      const marker = encoded.indexOf('#', index)
      const length = Number(encoded.slice(index, marker))
      const start = marker + 1
      words.push(encoded.slice(start, start + length))
      index = start + length
    }

    return words
  }
}

export { Solution }
