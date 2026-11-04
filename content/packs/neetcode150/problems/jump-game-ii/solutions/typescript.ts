class Solution {
  minLeaps(steps: number[]): number {
    let jumps = 0
    let layerEnd = 0
    let farthest = 0

    for (let index = 0; index < steps.length - 1; index += 1) {
      farthest = Math.max(farthest, index + steps[index])

      if (index === layerEnd) {
        jumps += 1
        layerEnd = farthest
      }
    }

    return jumps
  }
}

export { Solution }
