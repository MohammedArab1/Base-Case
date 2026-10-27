class Solution {
  climbWays(steps: number): number {
    if (steps <= 2) {
      return steps
    }

    let previous = 1
    let current = 2

    for (let step = 3; step <= steps; step += 1) {
      const next = previous + current
      previous = current
      current = next
    }

    return current
  }
}

export { Solution }
