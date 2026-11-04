class Solution:
    def longestSharedThread(self, first: str, second: str) -> int:
        if len(first) < len(second):
            first, second = second, first

        previous = [0] * (len(second) + 1)

        for first_char in first:
            current = [0] * (len(second) + 1)
            for index, second_char in enumerate(second, start=1):
                if first_char == second_char:
                    current[index] = previous[index - 1] + 1
                else:
                    current[index] = max(previous[index], current[index - 1])
            previous = current

        return previous[-1]
