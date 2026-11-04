class Solution:
    def minEatingRate(self, piles: list[int], hours: int) -> int:
        low = 1
        high = max(piles)

        def hours_needed(rate: int) -> int:
            total = 0
            for pile in piles:
                total += (pile + rate - 1) // rate
            return total

        while low < high:
            mid = (low + high) // 2
            if hours_needed(mid) <= hours:
                high = mid
            else:
                low = mid + 1

        return low
