from typing import List


class Solution:
    def maxRestProfit(self, prices: List[int]) -> int:
        resting = 0
        holding = -(10 ** 18)
        cooling = -(10 ** 18)

        for price in prices:
            previous_holding = holding
            previous_resting = resting
            previous_cooling = cooling

            holding = max(previous_holding, previous_resting - price)
            cooling = previous_holding + price
            resting = max(previous_resting, previous_cooling)

        return max(resting, cooling)
