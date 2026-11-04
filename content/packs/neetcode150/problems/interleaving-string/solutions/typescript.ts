class Solution {
  isWoven(first: string, second: string, woven: string): boolean {
    if (woven.length !== first.length + second.length) {
      return false
    }

    let previous = new Array<boolean>(second.length + 1).fill(false)
    previous[0] = true

    for (let index = 1; index <= second.length; index += 1) {
      previous[index] = previous[index - 1] && second[index - 1] === woven[index - 1]
    }

    for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
      const current = new Array<boolean>(second.length + 1).fill(false)
      current[0] = previous[0] && first[firstIndex - 1] === woven[firstIndex - 1]

      for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
        const takeFirst =
          previous[secondIndex] && first[firstIndex - 1] === woven[firstIndex + secondIndex - 1]
        const takeSecond =
          current[secondIndex - 1] &&
          second[secondIndex - 1] === woven[firstIndex + secondIndex - 1]
        current[secondIndex] = takeFirst || takeSecond
      }

      previous = current
    }

    return previous[second.length]
  }
}

export { Solution }
