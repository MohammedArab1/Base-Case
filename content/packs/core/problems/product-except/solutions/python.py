from typing import List


class Solution:
    def productExcept(self, nums: List[int]) -> List[int]:
        result = [1] * len(nums)
        prefix = 1

        for index, value in enumerate(nums):
            result[index] = prefix
            prefix *= value

        suffix = 1

        for index in range(len(nums) - 1, -1, -1):
            result[index] *= suffix
            suffix *= nums[index]

        return result
