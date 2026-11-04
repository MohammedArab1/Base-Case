from typing import List


class Solution:
    def increment(self, digits: List[int]) -> List[int]:
        result = digits[:]

        for index in range(len(result) - 1, -1, -1):
            if result[index] < 9:
                result[index] += 1
                return result

            result[index] = 0

        return [1] + result
