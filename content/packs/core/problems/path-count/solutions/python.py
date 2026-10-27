class Solution:
    def uniquePaths(self, rows: int, columns: int) -> int:
        dp = [1] * columns

        for _ in range(1, rows):
            for column in range(1, columns):
                dp[column] += dp[column - 1]

        return dp[columns - 1]
