class Solution {
  checkBrackets(text: string): boolean {
    let low = 0
    let high = 0

    for (const character of text) {
      if (character === '(') {
        low += 1
        high += 1
      } else if (character === ')') {
        low = Math.max(0, low - 1)
        high -= 1

        if (high < 0) {
          return false
        }
      } else {
        low = Math.max(0, low - 1)
        high += 1
      }
    }

    return low === 0
  }
}

export { Solution }
