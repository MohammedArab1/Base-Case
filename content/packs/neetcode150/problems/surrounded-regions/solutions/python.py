from typing import List


class Solution:
    def captureRegions(self, board: List[List[str]]) -> List[List[str]]:
        if not board or not board[0]:
            return []

        rows, cols = len(board), len(board[0])
        grid = [row[:] for row in board]
        safe = [[False] * cols for _ in range(rows)]
        stack = []

        for row in range(rows):
            for col in (0, cols - 1):
                if grid[row][col] == "O" and not safe[row][col]:
                    safe[row][col] = True
                    stack.append((row, col))

        for col in range(cols):
            for row in (0, rows - 1):
                if grid[row][col] == "O" and not safe[row][col]:
                    safe[row][col] = True
                    stack.append((row, col))

        while stack:
            row, col = stack.pop()
            for next_row, next_col in (
                (row + 1, col),
                (row - 1, col),
                (row, col + 1),
                (row, col - 1),
            ):
                if (
                    0 <= next_row < rows
                    and 0 <= next_col < cols
                    and grid[next_row][next_col] == "O"
                    and not safe[next_row][next_col]
                ):
                    safe[next_row][next_col] = True
                    stack.append((next_row, next_col))

        for row in range(rows):
            for col in range(cols):
                if grid[row][col] == "O" and not safe[row][col]:
                    grid[row][col] = "X"

        return grid
