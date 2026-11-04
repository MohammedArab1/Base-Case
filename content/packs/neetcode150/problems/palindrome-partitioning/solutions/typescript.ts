class Solution {
  partition(s: string): string[][] {
    const result: string[][] = []
    const path: string[] = []

    const isPalindrome = (left: number, right: number): boolean => {
      while (left < right) {
        if (s[left] !== s[right]) {
          return false
        }
        left += 1
        right -= 1
      }
      return true
    }

    const explore = (start: number): void => {
      if (start === s.length) {
        result.push([...path])
        return
      }

      for (let end = start; end < s.length; end += 1) {
        if (isPalindrome(start, end)) {
          path.push(s.slice(start, end + 1))
          explore(end + 1)
          path.pop()
        }
      }
    }

    explore(0)
    result.sort((a, b) => {
      const limit = Math.min(a.length, b.length)
      for (let index = 0; index < limit; index += 1) {
        if (a[index] < b[index]) {
          return -1
        }
        if (a[index] > b[index]) {
          return 1
        }
      }
      return a.length - b.length
    })
    return result
  }
}

export { Solution }
