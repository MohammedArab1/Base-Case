from typing import List


class Solution:
    def maxCircularLoot(self, values: List[int]) -> int:
        if len(values) == 1:
            return values[0]

        return max(
            self._best_range(values, 0, len(values) - 1),
            self._best_range(values, 1, len(values)),
        )

    def _best_range(self, values: List[int], start: int, end: int) -> int:
        take = 0
        skip = 0

        for index in range(start, end):
            take, skip = skip + values[index], max(skip, take)

        return max(take, skip)
