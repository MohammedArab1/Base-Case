from typing import List


class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:
        if not heights or not heights[0]:
            return []

        rows, cols = len(heights), len(heights[0])

        def reachable(starts):
            seen = [[False] * cols for _ in range(rows)]
            stack = []

            for row, col in starts:
                if not seen[row][col]:
                    seen[row][col] = True
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
                        and not seen[next_row][next_col]
                        and heights[next_row][next_col] >= heights[row][col]
                    ):
                        seen[next_row][next_col] = True
                        stack.append((next_row, next_col))

            return seen

        pacific_starts = [(0, col) for col in range(cols)]
        pacific_starts += [(row, 0) for row in range(rows)]
        atlantic_starts = [(rows - 1, col) for col in range(cols)]
        atlantic_starts += [(row, cols - 1) for row in range(rows)]

        pacific = reachable(pacific_starts)
        atlantic = reachable(atlantic_starts)

        return [
            [row, col]
            for row in range(rows)
            for col in range(cols)
            if pacific[row][col] and atlantic[row][col]
        ]
