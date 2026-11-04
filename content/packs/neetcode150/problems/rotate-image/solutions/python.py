from typing import List


class Solution:
    def rotateQuarter(self, matrix: List[List[int]]) -> List[List[int]]:
        size = len(matrix)
        result = [[0] * size for _ in range(size)]

        for row in range(size):
            for column in range(size):
                result[column][size - 1 - row] = matrix[row][column]

        return result
