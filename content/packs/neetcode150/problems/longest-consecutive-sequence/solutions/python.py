from typing import List


class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        values = set(nums)
        best = 0

        for value in values:
            if value - 1 in values:
                continue

            length = 1
            while value + length in values:
                length += 1

            best = max(best, length)

        return best
