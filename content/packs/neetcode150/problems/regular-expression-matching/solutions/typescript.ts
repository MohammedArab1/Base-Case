class Solution {
  isMatch(s: string, p: string): boolean {
    const stringLength = s.length
    const patternLength = p.length
    const dp = Array.from({ length: stringLength + 1 }, () =>
      new Array<boolean>(patternLength + 1).fill(false),
    )
    dp[0][0] = true

    for (let patternIndex = 2; patternIndex <= patternLength; patternIndex += 1) {
      if (p[patternIndex - 1] === '*') {
        dp[0][patternIndex] = dp[0][patternIndex - 2]
      }
    }

    for (let stringIndex = 1; stringIndex <= stringLength; stringIndex += 1) {
      for (let patternIndex = 1; patternIndex <= patternLength; patternIndex += 1) {
        if (p[patternIndex - 1] === '*') {
          dp[stringIndex][patternIndex] = dp[stringIndex][patternIndex - 2]
          const previous = p[patternIndex - 2]
          if (previous === '.' || previous === s[stringIndex - 1]) {
            dp[stringIndex][patternIndex] =
              dp[stringIndex][patternIndex] || dp[stringIndex - 1][patternIndex]
          }
        } else {
          const current = p[patternIndex - 1]
          if (current === '.' || current === s[stringIndex - 1]) {
            dp[stringIndex][patternIndex] = dp[stringIndex - 1][patternIndex - 1]
          }
        }
      }
    }

    return dp[stringLength][patternLength]
  }
}

export { Solution }
