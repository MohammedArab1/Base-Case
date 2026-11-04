from typing import List


class Solution:
    def partitionLengths(self, text: str) -> List[int]:
        last: dict[str, int] = {}

        for index, character in enumerate(text):
            last[character] = index

        result: List[int] = []
        start = 0
        end = 0

        for index, character in enumerate(text):
            end = max(end, last[character])

            if index == end:
                result.append(end - start + 1)
                start = index + 1

        return result
