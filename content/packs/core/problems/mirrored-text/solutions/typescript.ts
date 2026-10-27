class Solution {
  isMirrored(text: string): boolean {
    let left = 0
    let right = text.length - 1

    while (left < right) {
      while (left < right && !/[a-z0-9]/i.test(text[left])) {
        left += 1
      }
      while (left < right && !/[a-z0-9]/i.test(text[right])) {
        right -= 1
      }

      if (left < right && text[left].toLowerCase() !== text[right].toLowerCase()) {
        return false
      }

      left += 1
      right -= 1
    }

    return true
  }
}

export { Solution }
