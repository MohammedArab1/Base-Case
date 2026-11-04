class Solution {
  fastPower(base: number, exponent: number): number {
    let power = exponent

    if (power < 0) {
      base = 1.0 / base
      power = -power
    }

    let result = 1.0

    while (power > 0) {
      if (power % 2 === 1) {
        result *= base
      }

      base *= base
      power = Math.floor(power / 2)
    }

    return result
  }
}

export { Solution }
