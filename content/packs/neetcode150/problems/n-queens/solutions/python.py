class Solution:
    def totalNQueens(self, n: int) -> int:
        if n <= 0:
            return 0

        full_mask = (1 << n) - 1

        def count(row, columns, diagonal_down, diagonal_up):
            if row == n:
                return 1

            available = full_mask & ~(columns | diagonal_down | diagonal_up)
            total = 0

            while available:
                bit = available & -available
                available -= bit
                total += count(
                    row + 1,
                    columns | bit,
                    (diagonal_down | bit) << 1,
                    (diagonal_up | bit) >> 1,
                )

            return total

        return count(0, 0, 0, 0)
