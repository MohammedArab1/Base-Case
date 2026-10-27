class Solution {
  longestPalindromeLength(letters: string): number {
    const counts = new Array<number>(26).fill(0)

    for (const letter of letters) {
      counts[letter.charCodeAt(0) - 97] += 1
    }

    let pairs = 0
    let hasOdd = false

    for (const count of counts) {
      pairs += Math.floor(count / 2)

      if (count % 2 === 1) {
        hasOdd = true
      }
    }

    let length = pairs * 2

    if (hasOdd && length < letters.length) {
      length += 1
    }

    return length
  }
}

export { Solution }
