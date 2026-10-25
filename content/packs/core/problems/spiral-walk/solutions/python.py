from typing import List


class Solution:
    def spiralOrder(self, grid: List[List[int]]) -> List[int]:
        if not grid or not grid[0]:
            return []

        top = 0
        bottom = len(grid) - 1
        left = 0
        right = len(grid[0]) - 1
        result: List[int] = []

        while top <= bottom and left <= right:
            for column in range(left, right + 1):
                result.append(grid[top][column])
            top += 1

            for row in range(top, bottom + 1):
                result.append(grid[row][right])
            right -= 1

            if top <= bottom:
                for column in range(right, left - 1, -1):
                    result.append(grid[bottom][column])
                bottom -= 1

            if left <= right:
                for row in range(bottom, top - 1, -1):
                    result.append(grid[row][left])
                left += 1

        return result
