from typing import List


class Solution:
    def zeroMatrix(self, matrix: List[List[int]]) -> List[List[int]]:
        rows = len(matrix)
        columns = len(matrix[0])
        zero_rows = set()
        zero_columns = set()

        for row in range(rows):
            for column in range(columns):
                if matrix[row][column] == 0:
                    zero_rows.add(row)
                    zero_columns.add(column)

        result = [[0] * columns for _ in range(rows)]

        for row in range(rows):
            for column in range(columns):
                if row not in zero_rows and column not in zero_columns:
                    result[row][column] = matrix[row][column]

        return result
