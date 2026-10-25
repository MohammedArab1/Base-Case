from typing import List


class Solution:
    def daysUntilWarmer(self, temperatures: List[int]) -> List[int]:
        answer = [0] * len(temperatures)
        stack: List[int] = []

        for index, temperature in enumerate(temperatures):
            while stack and temperature > temperatures[stack[-1]]:
                earlier = stack.pop()
                answer[earlier] = index - earlier
            stack.append(index)

        return answer
