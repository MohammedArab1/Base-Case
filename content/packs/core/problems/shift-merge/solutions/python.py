from typing import List


class Solution:
    def mergeShifts(self, shifts: List[List[int]]) -> List[List[int]]:
        ordered = sorted((start, end) for start, end in shifts)
        merged: List[List[int]] = []

        for start, end in ordered:
            if not merged or start > merged[-1][1]:
                merged.append([start, end])
            elif end > merged[-1][1]:
                merged[-1][1] = end

        return merged
