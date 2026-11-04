class Solution:
    def checkBrackets(self, text: str) -> bool:
        low = 0
        high = 0

        for character in text:
            if character == '(':
                low += 1
                high += 1
            elif character == ')':
                low = max(0, low - 1)
                high -= 1

                if high < 0:
                    return False
            else:
                low = max(0, low - 1)
                high += 1

        return low == 0
