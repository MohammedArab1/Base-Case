from typing import List


class Solution:
    def missingValue(self, labels: List[int]) -> int:
        result = len(labels)

        for index, label in enumerate(labels):
            result ^= index
            result ^= label

        return result
