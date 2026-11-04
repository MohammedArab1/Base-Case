class Solution {
  countSignedAssignments(values: number[], target: number): number {
    const total = values.reduce((sum, value) => sum + value, 0)

    if (Math.abs(target) > total || (total + target) % 2 !== 0) {
      return 0
    }

    const wanted = Math.floor((total + target) / 2)
    const ways = new Array<number>(wanted + 1).fill(0)
    ways[0] = 1

    for (const value of values) {
      for (let subtotal = wanted; subtotal >= value; subtotal -= 1) {
        ways[subtotal] += ways[subtotal - value]
      }
    }

    return ways[wanted]
  }
}

export { Solution }
