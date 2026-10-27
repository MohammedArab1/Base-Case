class Solution:
    def climbWays(self, steps: int) -> int:
        if steps <= 2:
            return steps

        previous = 1
        current = 2

        for _ in range(3, steps + 1):
            previous, current = current, previous + current

        return current
