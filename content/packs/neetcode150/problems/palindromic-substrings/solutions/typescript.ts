class Solution {
  countMirrorSlices(text: string): number {
    const expand = (left: number, right: number): number => {
      let found = 0
      while (left >= 0 && right < text.length && text[left] === text[right]) {
        found += 1
        left -= 1
        right += 1
      }
      return found
    }

    let total = 0
    for (let center = 0; center < text.length; center += 1) {
      total += expand(center, center)
      total += expand(center, center + 1)
    }

    return total
  }
}

export { Solution }
