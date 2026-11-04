class Solution:
    def reverseBits(self, value: int) -> int:
        result = 0

        for _ in range(32):
            result = result * 2 + (value % 2)
            value //= 2

        return result
