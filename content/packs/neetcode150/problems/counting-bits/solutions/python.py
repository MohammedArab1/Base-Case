from typing import List


class Solution:
    def bitCounts(self, n: int) -> List[int]:
        counts = [0] * (n + 1)

        for value in range(1, n + 1):
            counts[value] = counts[value >> 1] + (value & 1)

        return counts
