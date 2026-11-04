class Solution:
    def maxCoins(self, nums: list[int]) -> int:
        values = [1] + nums + [1]
        size = len(values)
        dp = [[0] * size for _ in range(size)]

        for length in range(2, size):
            for left in range(0, size - length):
                right = left + length
                best = 0
                for last in range(left + 1, right):
                    coins = (
                        dp[left][last]
                        + values[left] * values[last] * values[right]
                        + dp[last][right]
                    )
                    if coins > best:
                        best = coins
                dp[left][right] = best

        return dp[0][size - 1]
