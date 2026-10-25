from typing import List


class Solution:
    def loneBeacon(self, signals: List[int]) -> int:
        result = 0

        for value in signals:
            result ^= value

        return result
