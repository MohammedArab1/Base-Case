class Solution {
  reverseDigits(value: number): number {
    const negative = value < 0
    let number = Math.abs(value)
    let reversedValue = 0

    while (number > 0) {
      reversedValue = reversedValue * 10 + (number % 10)
      number = Math.floor(number / 10)
    }

    if (negative) {
      return reversedValue <= 2147483648 ? -reversedValue : 0
    }

    return reversedValue <= 2147483647 ? reversedValue : 0
  }
}

export { Solution }
