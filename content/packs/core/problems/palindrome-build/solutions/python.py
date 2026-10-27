class Solution:
    def longestPalindromeLength(self, letters: str) -> int:
        counts = [0] * 26

        for letter in letters:
            counts[ord(letter) - ord("a")] += 1

        pairs = 0
        has_odd = False

        for count in counts:
            pairs += count // 2
            if count % 2 == 1:
                has_odd = True

        length = pairs * 2

        if has_odd and length < len(letters):
            length += 1

        return length
