from typing import List


class Solution:
    def majorityValue(self, nums: List[int]) -> int:
        candidate = nums[0]
        count = 0

        for value in nums:
            if count == 0:
                candidate = value

            count += 1 if value == candidate else -1

        return candidate
