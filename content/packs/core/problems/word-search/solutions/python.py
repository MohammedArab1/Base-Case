from typing import List


class Solution:
    def exists(self, board: List[str], word: str) -> bool:
        rows = len(board)
        columns = len(board[0])
        grid = [list(row) for row in board]

        def search(row: int, column: int, index: int) -> bool:
            if index == len(word):
                return True

            if row < 0 or row >= rows or column < 0 or column >= columns:
                return False

            if grid[row][column] != word[index]:
                return False

            saved = grid[row][column]
            grid[row][column] = "#"

            found = (
                search(row + 1, column, index + 1)
                or search(row - 1, column, index + 1)
                or search(row, column + 1, index + 1)
                or search(row, column - 1, index + 1)
            )

            grid[row][column] = saved
            return found

        for row in range(rows):
            for column in range(columns):
                if search(row, column, 0):
                    return True

        return False
