# Explanation

## Key insight

Each cell participates in exactly one row, one column, and one 3x3 box. Instead of checking every pair of cells, scan the board once and remember which digits have already appeared in each of those 27 units.

## Algorithm

1. Allocate nine sets for rows, nine for columns, and nine for boxes.
2. Scan every cell.
3. If the cell is `'.'`, skip it.
4. Compute its box index as `(row // 3) * 3 + (column // 3)`.
5. If the digit is already in the row set, column set, or box set, return `false`.
6. Otherwise add the digit to all three sets.
7. If the scan finishes, return `true`.

## Correctness

A duplicate can only occur when two filled cells in the same row, column, or box contain the same digit. When the second such cell is visited, its digit is already in the corresponding set, so the algorithm returns `false`. Conversely, if the algorithm returns `false`, it has found a digit present twice in a unit, which is a real violation. If it reaches the end, no unit has a repeated digit, so the grid is valid.

## Complexity

The board is always 9x9, so the scan does 81 constant-time operations.

- Time: `O(1)` (equivalently `O(9^2)`).
- Space: `O(1)` (at most 81 stored digits across the sets).

## Common mistakes

- Rejecting a board because it contains `'.'`; blanks are allowed and simply skipped.
- Checking rows and columns but not boxes.
- Using `row // 9` or a similar formula for the box, which collapses all boxes together.
- Requiring every digit to appear, or trying to solve the puzzle instead of checking consistency.
- Reusing one set for all units so unrelated rows interfere with one another.
