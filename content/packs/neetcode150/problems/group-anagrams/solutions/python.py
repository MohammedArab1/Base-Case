from typing import List


class Solution:
    def groupAnagrams(self, words: List[str]) -> List[List[str]]:
        groups: dict[tuple[int, ...], List[str]] = {}

        for word in words:
            counts = [0] * 26
            for char in word:
                counts[ord(char) - ord("a")] += 1

            key = tuple(counts)
            if key not in groups:
                groups[key] = []
            groups[key].append(word)

        result = [sorted(group) for group in groups.values()]
        result.sort(key=lambda group: group[0])
        return result
