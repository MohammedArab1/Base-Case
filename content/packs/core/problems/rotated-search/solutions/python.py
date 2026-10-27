from typing import List


class Solution:
    def searchRotated(self, nums: List[int], target: int) -> int:
        low = 0
        high = len(nums) - 1

        while low <= high:
            middle = low + (high - low) // 2

            if nums[middle] == target:
                return middle

            if nums[low] <= nums[middle]:
                if nums[low] <= target < nums[middle]:
                    high = middle - 1
                else:
                    low = middle + 1
            else:
                if nums[middle] < target <= nums[high]:
                    low = middle + 1
                else:
                    high = middle - 1

        return -1
