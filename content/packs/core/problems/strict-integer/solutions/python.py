class Solution:
    def parseInteger(self, text: str) -> int:
        index = 0
        length = len(text)

        while index < length and text[index] == " ":
            index += 1

        sign = 1

        if index < length and text[index] in "+-":
            if text[index] == "-":
                sign = -1
            index += 1

        limit = 2147483647 if sign == 1 else 2147483648
        value = 0

        while index < length and text[index].isdigit():
            digit = ord(text[index]) - ord("0")

            if value > (limit - digit) // 10:
                return 2147483647 if sign == 1 else -2147483648

            value = value * 10 + digit
            index += 1

        return sign * value
