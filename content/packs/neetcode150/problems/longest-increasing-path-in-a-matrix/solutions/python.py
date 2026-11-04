class Solution:
    def longestIncreasingPath(self, matrix: list[list[int]]) -> int:
        rows = len(matrix)
        columns = len(matrix[0])
        cells = [
            (matrix[row][column], row, column)
            for row in range(rows)
            for column in range(columns)
        ]
        cells.sort()

        best = [[1] * columns for _ in range(rows)]
        directions = ((1, 0), (-1, 0), (0, 1), (0, -1))
        answer = 0

        for _, row, column in cells:
            for delta_row, delta_column in directions:
                next_row = row + delta_row
                next_column = column + delta_column
                if (
                    0 <= next_row < rows
                    and 0 <= next_column < columns
                    and matrix[next_row][next_column] < matrix[row][column]
                ):
                    candidate = best[next_row][next_column] + 1
                    if candidate > best[row][column]:
                        best[row][column] = candidate
            if best[row][column] > answer:
                answer = best[row][column]

        return answer
