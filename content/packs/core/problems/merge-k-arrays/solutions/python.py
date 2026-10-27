from typing import List


class Solution:
    def mergeK(self, arrays: List[List[int]]) -> List[int]:
        if not arrays:
            return []

        working = [list(array) for array in arrays]

        def merge_two(first: List[int], second: List[int]) -> List[int]:
            result: List[int] = []
            left = 0
            right = 0

            while left < len(first) and right < len(second):
                if first[left] <= second[right]:
                    result.append(first[left])
                    left += 1
                else:
                    result.append(second[right])
                    right += 1

            result.extend(first[left:])
            result.extend(second[right:])
            return result

        while len(working) > 1:
            next_round: List[List[int]] = []

            for index in range(0, len(working) - 1, 2):
                next_round.append(merge_two(working[index], working[index + 1]))

            if len(working) % 2 == 1:
                next_round.append(working[-1])

            working = next_round

        return working[0]
