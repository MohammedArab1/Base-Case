from typing import List


class Solution:
    def maxStretch(self, nums: List[int]) -> int:
        ending = nums[0]
        best = nums[0]

        for value in nums[1:]:
            ending = max(value, ending + value)
            best = max(best, ending)

        return best
