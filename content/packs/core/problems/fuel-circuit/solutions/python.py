from typing import List


class Solution:
    def startingStation(self, gas: List[int], cost: List[int]) -> int:
        total = 0
        balance = 0
        candidate = 0

        for index, fuel in enumerate(gas):
            difference = fuel - cost[index]
            total += difference
            balance += difference

            if balance < 0:
                candidate = index + 1
                balance = 0

        return candidate if total >= 0 and candidate < len(gas) else -1
