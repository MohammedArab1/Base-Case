class Solution {
  canForm(triplets: number[][], target: number[]): boolean {
    const best = [0, 0, 0]

    for (const card of triplets) {
      const usable = card[0] <= target[0] && card[1] <= target[1] && card[2] <= target[2]

      if (!usable) {
        continue
      }

      for (let position = 0; position < 3; position += 1) {
        best[position] = Math.max(best[position], card[position])
      }
    }

    return best[0] === target[0] && best[1] === target[1] && best[2] === target[2]
  }
}

export { Solution }
