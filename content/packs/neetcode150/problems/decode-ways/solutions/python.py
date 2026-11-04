class Solution:
    def countCipherWays(self, digits: str) -> int:
        if not digits:
            return 0

        two_back = 1
        one_back = 1 if digits[0] != "0" else 0

        for index in range(1, len(digits)):
            current = 0

            if digits[index] != "0":
                current += one_back

            if digits[index - 1] == "1" or (
                digits[index - 1] == "2" and digits[index] <= "6"
            ):
                current += two_back

            two_back, one_back = one_back, current

        return one_back
