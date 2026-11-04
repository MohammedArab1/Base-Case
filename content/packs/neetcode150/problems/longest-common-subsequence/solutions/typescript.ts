class Solution {
  longestSharedThread(first: string, second: string): number {
    if (first.length < second.length) {
      const swap = first
      first = second
      second = swap
    }

    let previous = new Array<number>(second.length + 1).fill(0)

    for (let firstIndex = 0; firstIndex < first.length; firstIndex += 1) {
      const current = new Array<number>(second.length + 1).fill(0)
      for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
        if (first[firstIndex] === second[secondIndex - 1]) {
          current[secondIndex] = previous[secondIndex - 1] + 1
        } else {
          current[secondIndex] = Math.max(previous[secondIndex], current[secondIndex - 1])
        }
      }
      previous = current
    }

    return previous[second.length]
  }
}

export { Solution }
