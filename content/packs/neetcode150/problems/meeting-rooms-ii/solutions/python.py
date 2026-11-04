from typing import List


class Solution:
    def minRooms(self, intervals: List[List[int]]) -> int:
        if not intervals:
            return 0

        starts = sorted(interval[0] for interval in intervals)
        ends = sorted(interval[1] for interval in intervals)

        rooms = 0
        end_index = 0

        for start in starts:
            if end_index < len(ends) and ends[end_index] <= start:
                end_index += 1
            else:
                rooms += 1

        return rooms
