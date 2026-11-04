from typing import List


class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        rows = [set() for _ in range(9)]
        columns = [set() for _ in range(9)]
        boxes = [set() for _ in range(9)]

        for row in range(9):
            for column in range(9):
                value = board[row][column]
                if value == ".":
                    continue

                box = (row // 3) * 3 + (column // 3)
                if value in rows[row] or value in columns[column] or value in boxes[box]:
                    return False

                rows[row].add(value)
                columns[column].add(value)
                boxes[box].add(value)

        return True
