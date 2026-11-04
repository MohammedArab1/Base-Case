import heapq


class Solution:
    def swimInWater(self, grid: list[list[int]]) -> int:
        n = len(grid)
        infinity = float("inf")
        best = [[infinity] * n for _ in range(n)]
        best[0][0] = grid[0][0]
        heap = [(grid[0][0], 0, 0)]
        directions = ((1, 0), (-1, 0), (0, 1), (0, -1))

        while heap:
            time, row, column = heapq.heappop(heap)
            if time != best[row][column]:
                continue
            if row == n - 1 and column == n - 1:
                return time

            for delta_row, delta_column in directions:
                next_row = row + delta_row
                next_column = column + delta_column
                if 0 <= next_row < n and 0 <= next_column < n:
                    candidate = max(time, grid[next_row][next_column])
                    if candidate < best[next_row][next_column]:
                        best[next_row][next_column] = candidate
                        heapq.heappush(heap, (candidate, next_row, next_column))

        return best[n - 1][n - 1]
