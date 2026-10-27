from typing import List


class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        cheapest = float("inf")
        best = 0

        for price in prices:
            best = max(best, price - cheapest)
            cheapest = min(cheapest, price)

        return best
