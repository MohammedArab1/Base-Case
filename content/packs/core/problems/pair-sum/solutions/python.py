from typing import List


class Solution:
    def pairSum(self, nums: List[int], target: int) -> List[int]:
        seen: dict[int, int] = {}

        for index, value in enumerate(nums):
            complement = target - value

            if complement in seen:
                first = seen[complement]
                return [first, index] if first < index else [index, first]

            seen[value] = index

        return []
