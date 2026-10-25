from typing import List


class Solution:
    def maxSkipping(self, values: List[int]) -> int:
        take = 0
        skip = 0

        for value in values:
            take, skip = skip + value, max(skip, take)

        return max(take, skip)
