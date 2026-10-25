class Solution:
    def longestUnique(self, text: str) -> int:
        last_seen = {}
        left = 0
        best = 0

        for right, char in enumerate(text):
            previous = last_seen.get(char)
            if previous is not None and previous >= left:
                left = previous + 1

            last_seen[char] = right
            best = max(best, right - left + 1)

        return best
