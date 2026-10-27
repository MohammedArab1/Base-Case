from typing import List


class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()
        result: List[List[int]] = []
        path: List[int] = []

        def backtrack(start: int, remaining: int) -> None:
            if remaining == 0:
                result.append(path[:])
                return

            for index in range(start, len(candidates)):
                value = candidates[index]

                if value > remaining:
                    break

                path.append(value)
                backtrack(index, remaining - value)
                path.pop()

        backtrack(0, target)
        return result
