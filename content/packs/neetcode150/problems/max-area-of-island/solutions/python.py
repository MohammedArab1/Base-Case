from typing import List


class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:
        if not grid or not grid[0]:
            return 0

        rows, cols = len(grid), len(grid[0])
        cells = [row[:] for row in grid]
        best = 0

        for row in range(rows):
            for col in range(cols):
                if cells[row][col] != 1:
                    continue

                cells[row][col] = 0
                stack = [(row, col)]
                area = 0

                while stack:
                    current_row, current_col = stack.pop()
                    area += 1

                    for next_row, next_col in (
                        (current_row + 1, current_col),
                        (current_row - 1, current_col),
                        (current_row, current_col + 1),
                        (current_row, current_col - 1),
                    ):
                        if (
                            0 <= next_row < rows
                            and 0 <= next_col < cols
                            and cells[next_row][next_col] == 1
                        ):
                            cells[next_row][next_col] = 0
                            stack.append((next_row, next_col))

                best = max(best, area)

        return best
