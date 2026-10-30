from typing import List


class Solution:
    def countIslands(self, grid: List[List[int]]) -> int:
        if not grid or not grid[0]:
            return 0

        grid = [current[:] for current in grid]
        rows, cols = len(grid), len(grid[0])
        count = 0

        for row in range(rows):
            for col in range(cols):
                if grid[row][col] != 1:
                    continue

                count += 1
                stack = [(row, col)]

                while stack:
                    current_row, current_col = stack.pop()

                    if (
                        current_row < 0
                        or current_row >= rows
                        or current_col < 0
                        or current_col >= cols
                        or grid[current_row][current_col] != 1
                    ):
                        continue

                    grid[current_row][current_col] = 0
                    stack.append((current_row + 1, current_col))
                    stack.append((current_row - 1, current_col))
                    stack.append((current_row, current_col + 1))
                    stack.append((current_row, current_col - 1))

        return count
