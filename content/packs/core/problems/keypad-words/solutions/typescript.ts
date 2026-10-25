class Solution {
  letterWords(digits: string): string[] {
    const mapping: Record<string, string> = {
      '2': 'abc',
      '3': 'def',
      '4': 'ghi',
      '5': 'jkl',
      '6': 'mno',
      '7': 'pqrs',
      '8': 'tuv',
      '9': 'wxyz',
    }
    const words: string[] = []

    const walk = (index: number, prefix: string): void => {
      if (index === digits.length) {
        words.push(prefix)
        return
      }

      for (const letter of mapping[digits[index]]) {
        walk(index + 1, prefix + letter)
      }
    }

    walk(0, '')
    return words
  }
}

export { Solution }
