class Solution {
  uniquePaths(rows: number, columns: number): number {
    const dp = new Array<number>(columns).fill(1)

    for (let row = 1; row < rows; row += 1) {
      for (let column = 1; column < columns; column += 1) {
        dp[column] += dp[column - 1]
      }
    }

    return dp[columns - 1]
  }
}

export { Solution }
