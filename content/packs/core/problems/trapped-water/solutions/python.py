from typing import List


class Solution:
    def trapWater(self, heights: List[int]) -> int:
        left = 0
        right = len(heights) - 1
        left_max = 0
        right_max = 0
        water = 0

        while left < right:
            if heights[left] < heights[right]:
                left_max = max(left_max, heights[left])
                water += left_max - heights[left]
                left += 1
            else:
                right_max = max(right_max, heights[right])
                water += right_max - heights[right]
                right -= 1

        return water
