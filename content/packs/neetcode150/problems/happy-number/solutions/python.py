class Solution:
    def isCheerful(self, value: int) -> bool:
        seen = set()

        while value != 1 and value not in seen:
            seen.add(value)
            total = 0
            current = value

            while current > 0:
                digit = current % 10
                total += digit * digit
                current //= 10

            value = total

        return value == 1
