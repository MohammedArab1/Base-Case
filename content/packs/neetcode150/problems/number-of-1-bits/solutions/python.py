class Solution:
    def setBitCount(self, value: int) -> int:
        count = 0

        while value:
            value &= value - 1
            count += 1

        return count
