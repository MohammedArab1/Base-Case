from typing import List
from bisect import bisect_right


class Solution:
    def jobScheduling(self, starts: List[int], ends: List[int], profits: List[int]) -> int:
        jobs = sorted(zip(ends, starts, profits))
        finish_times = [end for end, _, _ in jobs]
        dp = [0] * (len(jobs) + 1)

        for index, (_, start, profit) in enumerate(jobs, start=1):
            compatible = bisect_right(finish_times, start, 0, index - 1)
            dp[index] = max(dp[index - 1], profit + dp[compatible])

        return dp[len(jobs)]
