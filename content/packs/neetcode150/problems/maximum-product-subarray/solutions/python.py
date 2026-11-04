from typing import List


class Solution:
    def maxProductStretch(self, values: List[int]) -> int:
        best = values[0]
        highest = values[0]
        lowest = values[0]

        for value in values[1:]:
            candidates = (value, highest * value, lowest * value)
            highest = max(candidates)
            lowest = min(candidates)
            best = max(best, highest)

        return best
