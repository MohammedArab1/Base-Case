from typing import List


class Solution:
    def findAnagrams(self, source: str, pattern: str) -> List[int]:
        if len(pattern) > len(source):
            return []

        need = [0] * 26
        window = [0] * 26

        for letter in pattern:
            need[ord(letter) - ord("a")] += 1

        result: List[int] = []

        for index, letter in enumerate(source):
            window[ord(letter) - ord("a")] += 1

            if index >= len(pattern):
                window[ord(source[index - len(pattern)]) - ord("a")] -= 1

            if index >= len(pattern) - 1 and window == need:
                result.append(index - len(pattern) + 1)

        return result
