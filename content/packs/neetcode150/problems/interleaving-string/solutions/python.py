class Solution:
    def isWoven(self, first: str, second: str, woven: str) -> bool:
        if len(woven) != len(first) + len(second):
            return False

        previous = [False] * (len(second) + 1)
        previous[0] = True

        for index in range(1, len(second) + 1):
            previous[index] = (
                previous[index - 1] and second[index - 1] == woven[index - 1]
            )

        for first_index in range(1, len(first) + 1):
            current = [False] * (len(second) + 1)
            current[0] = (
                previous[0] and first[first_index - 1] == woven[first_index - 1]
            )

            for second_index in range(1, len(second) + 1):
                take_first = (
                    previous[second_index]
                    and first[first_index - 1] == woven[first_index + second_index - 1]
                )
                take_second = (
                    current[second_index - 1]
                    and second[second_index - 1] == woven[first_index + second_index - 1]
                )
                current[second_index] = take_first or take_second

            previous = current

        return previous[len(second)]
