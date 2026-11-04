from typing import List


class Solution:
    def countSignedAssignments(self, values: List[int], target: int) -> int:
        total = sum(values)

        if abs(target) > total or (total + target) % 2 != 0:
            return 0

        wanted = (total + target) // 2
        ways = [0] * (wanted + 1)
        ways[0] = 1

        for value in values:
            for subtotal in range(wanted, value - 1, -1):
                ways[subtotal] += ways[subtotal - value]

        return ways[wanted]
