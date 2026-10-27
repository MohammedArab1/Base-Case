from typing import List
from collections import deque


class Solution:
    def nearestZero(self, grid: List[List[int]]) -> List[List[int]]:
        rows = len(grid)
        columns = len(grid[0])
        distance = [[-1] * columns for _ in range(rows)]
        queue = deque()

        for r in range(rows):
            for c in range(columns):
                if grid[r][c] == 0:
                    distance[r][c] = 0
                    queue.append((r, c))

        while queue:
            r, c = queue.popleft()

            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < columns and distance[nr][nc] == -1:
                    distance[nr][nc] = distance[r][c] + 1
                    queue.append((nr, nc))

        return distance
