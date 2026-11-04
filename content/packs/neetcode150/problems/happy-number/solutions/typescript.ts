class Solution {
  isCheerful(value: number): boolean {
    const seen = new Set<number>()

    while (value !== 1 && !seen.has(value)) {
      seen.add(value)
      let total = 0
      let current = value

      while (current > 0) {
        const digit = current % 10
        total += digit * digit
        current = Math.floor(current / 10)
      }

      value = total
    }

    return value === 1
  }
}

export { Solution }
