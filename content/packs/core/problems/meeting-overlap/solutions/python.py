from typing import List


class Solution:
    def canAttendAll(self, intervals: List[List[int]]) -> bool:
        ordered = sorted(intervals, key=lambda interval: interval[0])

        for index in range(1, len(ordered)):
            if ordered[index][0] < ordered[index - 1][1]:
                return False

        return True
