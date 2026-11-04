import bisect
from typing import List


class Solution:
    def medianOperations(self, operations: List[str], values: List[int]) -> List[float]:
        numbers = []
        medians = []

        for operation, value in zip(operations, values):
            if operation == "addNum":
                bisect.insort(numbers, value)
            else:
                size = len(numbers)
                if size % 2 == 1:
                    medians.append(float(numbers[size // 2]))
                else:
                    medians.append(
                        (numbers[size // 2 - 1] + numbers[size // 2]) / 2.0
                    )

        return medians
