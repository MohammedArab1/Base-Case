# Explanation

## Key insight

The two sort directions make the top-right corner a decision point. At `(row, col)` with `col` at the last column, every value to the left is at most `matrix[row][col]`, and every value below is at least `matrix[row][col]`. Comparing the target with that one cell tells us which part of the table cannot contain the answer.

## Algorithm

1. Start at the top-right cell.
2. If the cell equals the target, return `true`.
3. If the cell is too large, move one column left. Every value below it is even larger, so this column can be discarded.
4. If the cell is too small, move one row down. Every value to its left is even smaller, so this row can be discarded.
5. If the row passes the bottom or the column passes the left edge, return `false`.

## Correctness

Invariant: before each comparison, every cell that could still contain the target lies inside the rectangle bounded by the current row, the current column, the bottom row, and the left edge. Each comparison removes exactly one row or one column from this rectangle and never removes a cell that could contain the target. Every step shrinks the rectangle, so the loop terminates. If the target exists, its cell remains in the rectangle until it is visited and matched. If the loop ends, the rectangle is empty, so the target is absent.

## Complexity

- Time: `O(rows + columns)`, because each step removes one row or one column.
- Space: `O(1)` extra space.

## Common mistakes

- Starting at the top-left corner, where both available directions increase.
- Moving both left and down in the same step.
- Forgetting the empty-table case or a table whose first row is empty.
- Treating the table as a single flattened sorted array; the rows are sorted, but the last value of one row need not be smaller than the first value of the next.
