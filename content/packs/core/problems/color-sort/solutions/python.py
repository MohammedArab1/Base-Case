from typing import List


class Solution:
    def sortColors(self, nums: List[int]) -> None:
        low = 0
        middle = 0
        high = len(nums) - 1

        while middle <= high:
            if nums[middle] == 0:
                nums[low], nums[middle] = nums[middle], nums[low]
                low += 1
                middle += 1
            elif nums[middle] == 1:
                middle += 1
            else:
                nums[middle], nums[high] = nums[high], nums[middle]
                high -= 1
