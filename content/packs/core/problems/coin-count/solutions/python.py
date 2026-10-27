from typing import List


class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        impossible = amount + 1
        dp = [impossible] * (amount + 1)
        dp[0] = 0

        for value in range(1, amount + 1):
            for coin in coins:
                if coin <= value:
                    dp[value] = min(dp[value], dp[value - coin] + 1)

        return -1 if dp[amount] == impossible else dp[amount]
