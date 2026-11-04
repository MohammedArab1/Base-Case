from typing import List


class Solution:
    def canReach(self, steps: List[int]) -> bool:
        farthest = 0
        last = len(steps) - 1

        for index, leap in enumerate(steps):
            if index > farthest:
                return False

            farthest = max(farthest, index + leap)

            if farthest >= last:
                return True

        return True
