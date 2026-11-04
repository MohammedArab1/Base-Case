class Solution {
  multiplyDecimal(num1: string, num2: string): string {
    if (num1 === '0' || num2 === '0') {
      return '0'
    }

    const digits = new Array<number>(num1.length + num2.length).fill(0)

    for (let i = num1.length - 1; i >= 0; i -= 1) {
      for (let j = num2.length - 1; j >= 0; j -= 1) {
        const product = (num1.charCodeAt(i) - 48) * (num2.charCodeAt(j) - 48)
        const total = product + digits[i + j + 1]
        digits[i + j + 1] = total % 10
        digits[i + j] += Math.floor(total / 10)
      }
    }

    let start = 0
    while (start < digits.length - 1 && digits[start] === 0) {
      start += 1
    }

    return digits.slice(start).join('')
  }
}

export { Solution }
