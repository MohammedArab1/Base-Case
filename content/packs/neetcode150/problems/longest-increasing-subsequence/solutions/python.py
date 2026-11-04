from bisect import bisect_left
from typing import List


class Solution:
    def longestUphillRun(self, values: List[int]) -> int:
        tails = []

        for value in values:
            position = bisect_left(tails, value)

            if position == len(tails):
                tails.append(value)
            else:
                tails[position] = value

        return len(tails)
