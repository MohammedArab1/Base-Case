from typing import List
from collections import deque


class Solution:
    def ladderLength(self, begin: str, end: str, words: List[str]) -> int:
        if end not in words:
            return 0
        if begin == end:
            return 1

        available = set(words)
        available.discard(begin)
        queue = deque([(begin, 1)])

        while queue:
            word, distance = queue.popleft()

            for index in range(len(word)):
                for code in range(ord("a"), ord("z") + 1):
                    candidate = word[:index] + chr(code) + word[index + 1 :]

                    if candidate == end:
                        return distance + 1

                    if candidate in available:
                        available.remove(candidate)
                        queue.append((candidate, distance + 1))

        return 0
