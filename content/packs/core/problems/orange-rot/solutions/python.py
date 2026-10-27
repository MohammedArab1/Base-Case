from typing import List
from collections import deque


class Solution:
    def rottenMinutes(self, grid: List[List[int]]) -> int:
        rows = len(grid)
        columns = len(grid[0])
        queue = deque()
        fresh = 0

        for r in range(rows):
            for c in range(columns):
                if grid[r][c] == 1:
                    fresh += 1
                elif grid[r][c] == 2:
                    queue.append((r, c))

        minutes = 0

        while queue and fresh > 0:
            for _ in range(len(queue)):
                r, c = queue.popleft()

                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if 0 <= nr < rows and 0 <= nc < columns and grid[nr][nc] == 1:
                        grid[nr][nc] = 2
                        fresh -= 1
                        queue.append((nr, nc))

            minutes += 1

        return minutes if fresh == 0 else -1
