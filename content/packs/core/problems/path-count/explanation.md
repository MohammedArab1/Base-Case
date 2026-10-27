# Explanation

## Key insight

Every cell can be reached from the cell above or the cell to its left, so its path count is the sum of those two counts.

## Algorithm

1. Initialize a one-dimensional table of ones for the first row.
2. For each later row, update each column left to right by adding the value from the previous column.
3. Return the last entry.

## Correctness

Before updating a row, `dp[column]` holds the path count from the row above, and `dp[column - 1]` has already been updated to the current row. Their sum is therefore the number of paths entering from above and from the left. By induction, every cell's count is correct.

## Complexity

- Time: `O(rows * columns)`.
- Space: `O(columns)`.

## Common mistakes

- Allowing diagonal moves.
- Reinitializing the first column on every row.
- Returning the number of moves instead of the number of paths.

## Related pattern

The same grid DP handles obstacle grids and minimum path sums.
