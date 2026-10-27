class Solution:
    def calculate(self, expression: str) -> int:
        total = 0
        number = 0
        sign = 1
        stack = []

        for character in expression:
            if character.isdigit():
                number = number * 10 + int(character)
            elif character == "+" or character == "-":
                total += sign * number
                number = 0
                sign = 1 if character == "+" else -1
            elif character == "(":
                stack.append(total)
                stack.append(sign)
                total = 0
                sign = 1
                number = 0
            elif character == ")":
                total += sign * number
                number = 0
                total *= stack.pop()
                total += stack.pop()

        return total + sign * number
