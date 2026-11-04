from typing import List


class Solution:
    def minAscentCost(self, cost: List[int]) -> int:
        two_back = 0
        one_back = 0

        for position in range(2, len(cost) + 1):
            current = min(
                one_back + cost[position - 1],
                two_back + cost[position - 2],
            )
            two_back, one_back = one_back, current

        return one_back
