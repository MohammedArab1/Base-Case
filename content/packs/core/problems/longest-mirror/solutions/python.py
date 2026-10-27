class Solution:
    def longestMirror(self, text: str) -> str:
        if not text:
            return ""

        best_start = 0
        best_length = 1

        def expand(left: int, right: int) -> tuple[int, int]:
            while left >= 0 and right < len(text) and text[left] == text[right]:
                left -= 1
                right += 1

            return left + 1, right - left - 1

        for center in range(len(text)):
            start, length = expand(center, center)

            if length > best_length:
                best_start = start
                best_length = length

            start, length = expand(center, center + 1)

            if length > best_length:
                best_start = start
                best_length = length

        return text[best_start : best_start + best_length]
