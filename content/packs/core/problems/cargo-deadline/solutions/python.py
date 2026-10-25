from typing import List


class Solution:
    def minCapacity(self, weights: List[int], days: int) -> int:
        def ships_needed(capacity: int) -> int:
            ships = 1
            load = 0

            for weight in weights:
                if load + weight > capacity:
                    ships += 1
                    load = weight
                else:
                    load += weight

            return ships

        low = max(weights)
        high = sum(weights)

        while low < high:
            middle = low + (high - low) // 2

            if ships_needed(middle) <= days:
                high = middle
            else:
                low = middle + 1

        return low
