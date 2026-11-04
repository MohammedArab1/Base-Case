class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        counts = [0] * 26
        left = 0
        best = 0

        for right, char in enumerate(s):
            counts[ord(char) - ord("a")] += 1

            while (right - left + 1) - max(counts) > k:
                counts[ord(s[left]) - ord("a")] -= 1
                left += 1

            best = max(best, right - left + 1)

        return best
