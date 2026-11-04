from collections import deque
from typing import List


class Solution:
    def wallsAndGates(self, rooms: List[List[int]]) -> List[List[int]]:
        if not rooms or not rooms[0]:
            return []

        inf = 2147483647
        rows, cols = len(rooms), len(rooms[0])
        grid = [row[:] for row in rooms]
        queue = deque()

        for row in range(rows):
            for col in range(cols):
                if grid[row][col] == 0:
                    queue.append((row, col))

        while queue:
            row, col = queue.popleft()
            for next_row, next_col in (
                (row + 1, col),
                (row - 1, col),
                (row, col + 1),
                (row, col - 1),
            ):
                if (
                    0 <= next_row < rows
                    and 0 <= next_col < cols
                    and grid[next_row][next_col] == inf
                ):
                    grid[next_row][next_col] = grid[row][col] + 1
                    queue.append((next_row, next_col))

        return grid
