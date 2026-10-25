class Solution {
  minEdits(source: string, target: string): number {
    let previous = Array.from({ length: target.length + 1 }, (_value, index) => index)

    for (let sourceIndex = 1; sourceIndex <= source.length; sourceIndex += 1) {
      const current = new Array<number>(target.length + 1).fill(0)
      current[0] = sourceIndex

      for (let targetIndex = 1; targetIndex <= target.length; targetIndex += 1) {
        if (source[sourceIndex - 1] === target[targetIndex - 1]) {
          current[targetIndex] = previous[targetIndex - 1]
        } else {
          current[targetIndex] =
            1 + Math.min(previous[targetIndex], current[targetIndex - 1], previous[targetIndex - 1])
        }
      }

      previous = current
    }

    return previous[target.length]
  }
}

export { Solution }
