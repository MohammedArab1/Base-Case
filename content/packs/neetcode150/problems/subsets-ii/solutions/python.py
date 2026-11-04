from typing import List


class Solution:
    def subsetsWithDup(self, nums: List[int]) -> List[List[int]]:
        nums = sorted(nums)
        result = []
        path = []

        def explore(start):
            result.append(path[:])
            for index in range(start, len(nums)):
                if index > start and nums[index] == nums[index - 1]:
                    continue
                path.append(nums[index])
                explore(index + 1)
                path.pop()

        explore(0)
        return result
