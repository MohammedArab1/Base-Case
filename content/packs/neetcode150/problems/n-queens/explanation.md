# Explanation

## Approach

Place one queen in each row. At row `row`, try every column that is not already used by an earlier queen and whose two diagonals are also free. After placing the queen, recurse to the next row. Reaching row `n` means all queens were placed legally, so return one.

The implementation uses bitmasks. `cols` marks occupied columns. `diag_down` marks occupied `row - col` diagonals, and shifting it left after each row models how those diagonals move. `diag_up` does the same for `row + col` diagonals with a right shift. Available positions are the bits not present in any mask.

## Correctness

The recursion chooses exactly one square in every row, so each complete path places `n` queens. Before placing a queen, the algorithm rejects any column or diagonal that already contains a queen. Rows are unique by construction. Therefore every accepted placement is non-attacking. Conversely, any valid placement chooses a column in each row that passes all three checks, so the recursion reaches it. Each placement corresponds to exactly one sequence of column choices, so the final count is exact.

## Complexity

- Time: `O(n!)` in the worst case, heavily pruned by the attack checks.
- Space: `O(n)` for the recursion stack.

## Common mistakes

- Checking only columns and forgetting both diagonal directions.
- Placing more than one queen in a row.
- Counting board symmetries as the same placement.
- Using signed 32-bit arithmetic for masks when `n` is large; here `n <= 13`, but the masks still grow quickly.
