from typing import List


class Solution:
    def wordBreak(self, text: str, words: List[str]) -> bool:
        dictionary = set(words)
        maximum = max((len(word) for word in words), default=0)
        reachable = [False] * (len(text) + 1)
        reachable[0] = True

        for end in range(1, len(text) + 1):
            start = max(0, end - maximum)

            while start < end:
                if reachable[start] and text[start:end] in dictionary:
                    reachable[end] = True
                    break
                start += 1

        return reachable[len(text)]
