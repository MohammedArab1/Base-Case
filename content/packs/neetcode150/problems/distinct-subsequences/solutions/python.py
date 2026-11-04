class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        if len(t) > len(s):
            return 0

        previous = [0] * (len(t) + 1)
        previous[0] = 1

        for character in s:
            current = [0] * (len(t) + 1)
            current[0] = 1
            for index in range(1, len(t) + 1):
                current[index] = previous[index]
                if character == t[index - 1]:
                    current[index] += previous[index - 1]
            previous = current

        return previous[len(t)]
