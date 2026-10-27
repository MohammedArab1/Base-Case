class Solution {
  minWindow(source: string, target: string): string {
    if (target.length > source.length) {
      return ''
    }
    if (target.length === 0) {
      return ''
    }

    const need = new Array<number>(26).fill(0)

    for (const letter of target) {
      need[letter.charCodeAt(0) - 97] += 1
    }

    const required = need.filter((count) => count > 0).length
    const window = new Array<number>(26).fill(0)
    let formed = 0
    let left = 0
    let bestStart = 0
    let bestLength = source.length + 1

    for (let right = 0; right < source.length; right += 1) {
      const index = source.charCodeAt(right) - 97
      window[index] += 1

      if (need[index] > 0 && window[index] === need[index]) {
        formed += 1
      }

      while (formed === required) {
        const length = right - left + 1

        if (length < bestLength) {
          bestLength = length
          bestStart = left
        }

        const leftIndex = source.charCodeAt(left) - 97
        window[leftIndex] -= 1

        if (need[leftIndex] > 0 && window[leftIndex] < need[leftIndex]) {
          formed -= 1
        }

        left += 1
      }
    }

    if (bestLength > source.length) {
      return ''
    }

    return source.slice(bestStart, bestStart + bestLength)
  }
}

export { Solution }
