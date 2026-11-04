class Solution:
    def fastPower(self, base: float, exponent: int) -> float:
        power = exponent

        if power < 0:
            base = 1.0 / base
            power = -power

        result = 1.0

        while power > 0:
            if power % 2 == 1:
                result *= base

            base *= base
            power //= 2

        return result
