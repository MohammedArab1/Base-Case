from typing import List


class Solution:
    def minLeaps(self, steps: List[int]) -> int:
        jumps = 0
        layer_end = 0
        farthest = 0

        for index in range(len(steps) - 1):
            farthest = max(farthest, index + steps[index])

            if index == layer_end:
                jumps += 1
                layer_end = farthest

        return jumps
