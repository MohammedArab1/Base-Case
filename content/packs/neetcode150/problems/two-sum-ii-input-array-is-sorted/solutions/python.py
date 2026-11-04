from typing import List


class Solution:
    def twoSumSorted(self, numbers: List[int], target: int) -> List[int]:
        left = 0
        right = len(numbers) - 1

        while left < right:
            total = numbers[left] + numbers[right]

            if total == target:
                return [left, right]
            if total < target:
                left += 1
            else:
                right -= 1

        return []
