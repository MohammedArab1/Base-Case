from typing import List


class Solution:
    def countRanges(self, weights: List[int], target: int) -> int:
        counts: dict[int, int] = {0: 1}
        running = 0
        answer = 0

        for value in weights:
            running += value
            answer += counts.get(running - target, 0)
            counts[running] = counts.get(running, 0) + 1

        return answer
