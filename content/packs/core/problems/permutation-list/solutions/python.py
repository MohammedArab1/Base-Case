from typing import List


class Solution:
    def permutations(self, nums: List[int]) -> List[List[int]]:
        nums = sorted(nums)
        result: List[List[int]] = []
        path: List[int] = []
        used = [False] * len(nums)

        def backtrack() -> None:
            if len(path) == len(nums):
                result.append(path[:])
                return

            for index, value in enumerate(nums):
                if used[index]:
                    continue

                used[index] = True
                path.append(value)
                backtrack()
                path.pop()
                used[index] = False

        backtrack()
        return result
