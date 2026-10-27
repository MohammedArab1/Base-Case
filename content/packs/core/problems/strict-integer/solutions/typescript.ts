class Solution {
  parseInteger(text: string): number {
    let index = 0

    while (index < text.length && text[index] === ' ') {
      index += 1
    }

    let sign = 1

    if (index < text.length && (text[index] === '+' || text[index] === '-')) {
      if (text[index] === '-') {
        sign = -1
      }
      index += 1
    }

    const limit = sign === 1 ? 2147483647 : 2147483648
    let value = 0

    while (index < text.length && text[index] >= '0' && text[index] <= '9') {
      const digit = text.charCodeAt(index) - 48

      if (value > Math.floor((limit - digit) / 10)) {
        return sign === 1 ? 2147483647 : -2147483648
      }

      value = value * 10 + digit
      index += 1
    }

    return sign * value
  }
}

export { Solution }
