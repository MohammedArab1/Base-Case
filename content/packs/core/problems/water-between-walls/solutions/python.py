from typing import List


class Solution:
    def maxWater(self, heights: List[int]) -> int:
        left, right = 0, len(heights) - 1
        best = 0

        while left < right:
            width = right - left
            height = min(heights[left], heights[right])
            best = max(best, width * height)

            if heights[left] <= heights[right]:
                left += 1
            else:
                right -= 1

        return best
