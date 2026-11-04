from typing import List


class Solution:
    def minRemovals(self, intervals: List[List[int]]) -> int:
        ordered = sorted(intervals, key=lambda interval: interval[1])
        kept = 0
        last_end = float('-inf')

        for start, end in ordered:
            if start >= last_end:
                kept += 1
                last_end = end

        return len(intervals) - kept
