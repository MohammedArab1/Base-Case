class Solution {
  numDistinct(s: string, t: string): number {
    if (t.length > s.length) return 0

    let previous = new Array<number>(t.length + 1).fill(0)
    previous[0] = 1

    for (const character of s) {
      const current = new Array<number>(t.length + 1).fill(0)
      current[0] = 1
      for (let index = 1; index <= t.length; index += 1) {
        current[index] = previous[index]
        if (character === t[index - 1]) {
          current[index] += previous[index - 1]
        }
      }
      previous = current
    }

    return previous[t.length]
  }
}

export { Solution }
