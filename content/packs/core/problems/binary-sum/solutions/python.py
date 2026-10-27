class Solution:
    def addBinary(self, first: str, second: str) -> str:
        left = len(first) - 1
        right = len(second) - 1
        carry = 0
        digits = []

        while left >= 0 or right >= 0 or carry:
            total = carry

            if left >= 0:
                total += int(first[left])
                left -= 1
            if right >= 0:
                total += int(second[right])
                right -= 1

            digits.append(str(total % 2))
            carry = total // 2

        return "".join(reversed(digits))
