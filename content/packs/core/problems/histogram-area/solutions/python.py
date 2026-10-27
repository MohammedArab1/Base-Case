from typing import List


class Solution:
    def largestRectangle(self, heights: List[int]) -> int:
        if not heights:
            return 0

        stack: List[int] = []
        best = 0
        count = len(heights)

        for index in range(count + 1):
            height = heights[index] if index < count else 0

            while stack and heights[stack[-1]] > height:
                bar = stack.pop()
                width = index if not stack else index - stack[-1] - 1
                best = max(best, heights[bar] * width)

            if index < count:
                stack.append(index)

        return best
