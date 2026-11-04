class Solution:
    def multiplyDecimal(self, num1: str, num2: str) -> str:
        if num1 == "0" or num2 == "0":
            return "0"

        first = len(num1)
        second = len(num2)
        digits = [0] * (first + second)

        for i in range(first - 1, -1, -1):
            for j in range(second - 1, -1, -1):
                product = (ord(num1[i]) - ord("0")) * (ord(num2[j]) - ord("0"))
                total = product + digits[i + j + 1]
                digits[i + j + 1] = total % 10
                digits[i + j] += total // 10

        start = 0
        while start < len(digits) - 1 and digits[start] == 0:
            start += 1

        return "".join(str(digit) for digit in digits[start:])
