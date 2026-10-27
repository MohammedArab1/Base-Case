class Solution:
    def isTallyMatch(self, first: str, second: str) -> bool:
        if len(first) != len(second):
            return False

        counts: dict[str, int] = {}

        for letter in first:
            counts[letter] = counts.get(letter, 0) + 1

        for letter in second:
            counts[letter] = counts.get(letter, 0) - 1
            if counts[letter] < 0:
                return False

        return True
