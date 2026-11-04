class Solution {
  countCipherWays(digits: string): number {
    if (digits.length === 0) {
      return 0
    }

    let twoBack = 1
    let oneBack = digits[0] !== '0' ? 1 : 0

    for (let index = 1; index < digits.length; index += 1) {
      let current = 0

      if (digits[index] !== '0') {
        current += oneBack
      }

      if (digits[index - 1] === '1' || (digits[index - 1] === '2' && digits[index] <= '6')) {
        current += twoBack
      }

      twoBack = oneBack
      oneBack = current
    }

    return oneBack
  }
}

export { Solution }
