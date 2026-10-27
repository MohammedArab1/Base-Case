from typing import List


class Solution:
    def insertInterval(self, intervals: List[List[int]], incoming: List[int]) -> List[List[int]]:
        result: List[List[int]] = []
        index = 0
        count = len(intervals)

        while index < count and intervals[index][1] < incoming[0]:
            result.append(intervals[index])
            index += 1

        start, end = incoming

        while index < count and intervals[index][0] <= end:
            start = min(start, intervals[index][0])
            end = max(end, intervals[index][1])
            index += 1

        result.append([start, end])

        while index < count:
            result.append(intervals[index])
            index += 1

        return result
