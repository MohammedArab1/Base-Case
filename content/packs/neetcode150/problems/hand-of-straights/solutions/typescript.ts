class Solution {
  canGroup(hand: number[], groupSize: number): boolean {
    if (hand.length % groupSize !== 0) {
      return false
    }

    const counts = new Map<number, number>()
    for (const value of hand) {
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }

    const values = [...counts.keys()].sort((left, right) => left - right)

    for (const value of values) {
      const amount = counts.get(value) ?? 0

      if (amount === 0) {
        continue
      }

      for (let offset = 0; offset < groupSize; offset += 1) {
        const needed = value + offset
        const available = counts.get(needed) ?? 0

        if (available < amount) {
          return false
        }

        counts.set(needed, available - amount)
      }
    }

    return true
  }
}

export { Solution }
