from typing import List


class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        values = sorted(nums)
        result: List[List[int]] = []
        path: List[int] = []

        def backtrack(start: int) -> None:
            result.append(path[:])

            for index in range(start, len(values)):
                path.append(values[index])
                backtrack(index + 1)
                path.pop()

        backtrack(0)
        result.sort(key=lambda subset: (len(subset), subset))
        return result
