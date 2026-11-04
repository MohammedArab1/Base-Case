class Solution {
  reverseBits(value: number): number {
    let result = 0
    let current = value

    for (let step = 0; step < 32; step += 1) {
      result = result * 2 + (current % 2)
      current = Math.floor(current / 2)
    }

    return result
  }
}

export { Solution }
