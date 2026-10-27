class Solution {
  addBinary(first: string, second: string): string {
    let left = first.length - 1
    let right = second.length - 1
    let carry = 0
    const digits: string[] = []

    while (left >= 0 || right >= 0 || carry > 0) {
      let total = carry

      if (left >= 0) {
        total += Number(first[left])
        left -= 1
      }
      if (right >= 0) {
        total += Number(second[right])
        right -= 1
      }

      digits.push(String(total % 2))
      carry = Math.floor(total / 2)
    }

    return digits.reverse().join('')
  }
}

export { Solution }
