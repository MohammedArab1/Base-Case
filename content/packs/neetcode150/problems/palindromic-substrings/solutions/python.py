class Solution:
    def countMirrorSlices(self, text: str) -> int:
        def expand(left: int, right: int) -> int:
            found = 0
            while left >= 0 and right < len(text) and text[left] == text[right]:
                found += 1
                left -= 1
                right += 1
            return found

        total = 0
        for center in range(len(text)):
            total += expand(center, center)
            total += expand(center, center + 1)

        return total
