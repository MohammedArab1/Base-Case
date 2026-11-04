class Solution:
    def reverseDigits(self, value: int) -> int:
        negative = value < 0
        number = abs(value)
        reversed_value = 0

        while number > 0:
            reversed_value = reversed_value * 10 + number % 10
            number //= 10

        if negative:
            return -reversed_value if reversed_value <= 2**31 else 0

        return reversed_value if reversed_value <= 2**31 - 1 else 0
