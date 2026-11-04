from typing import List


class Solution:
    def countCoinCombinations(self, amount: int, coins: List[int]) -> int:
        ways = [0] * (amount + 1)
        ways[0] = 1

        for coin in coins:
            for value in range(coin, amount + 1):
                ways[value] += ways[value - coin]

        return ways[amount]
