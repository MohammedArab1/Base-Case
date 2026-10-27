from typing import List


class Solution:
    def searchIndex(self, nums: List[int], target: int) -> int:
        low = 0
        high = len(nums)

        while low < high:
            middle = low + (high - low) // 2

            if nums[middle] == target:
                return middle
            if nums[middle] < target:
                low = middle + 1
            else:
                high = middle

        return -1
