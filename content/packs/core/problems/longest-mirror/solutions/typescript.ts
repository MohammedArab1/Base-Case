class Solution {
  longestMirror(text: string): string {
    if (text.length === 0) {
      return ''
    }

    let bestStart = 0
    let bestLength = 1

    const expand = (left: number, right: number): [number, number] => {
      while (left >= 0 && right < text.length && text[left] === text[right]) {
        left -= 1
        right += 1
      }

      return [left + 1, right - left - 1]
    }

    for (let center = 0; center < text.length; center += 1) {
      let [start, length] = expand(center, center)

      if (length > bestLength) {
        bestStart = start
        bestLength = length
      }

      ;[start, length] = expand(center, center + 1)

      if (length > bestLength) {
        bestStart = start
        bestLength = length
      }
    }

    return text.slice(bestStart, bestStart + bestLength)
  }
}

export { Solution }
