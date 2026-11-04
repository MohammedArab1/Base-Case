## Approach

Scan the original matrix once to collect every row and column that contains a zero. Then construct a new matrix. A cell becomes zero exactly when its row is in the affected row set or its column is in the affected column set; otherwise it keeps its original value.

Because the affected rows and columns are recorded before any output is written, zeros created during construction cannot influence the sets. This matches the requirement that clearing is based only on the original matrix.

## Correctness

Every original zero causes its row and column to enter the sets, so every cell in those rows and columns is cleared. Conversely, if a cell is cleared, its row or column contained an original zero, so the clearing is required. Cells outside all affected rows and columns retain their original values. Therefore the result is exactly the matrix produced by clearing the original zero rows and columns once, with no cascading.

## Complexity

- Time: `O(m * n)` for the two scans.
- Space: `O(m + n)` for the row and column sets, plus the output matrix.

## Common mistakes

- Clearing rows and columns while still scanning, which can cascade.
- Forgetting to clear every cell in an affected column.
- Modifying the input instead of returning a new matrix.
- Using only rows or only columns when marking zeros.

## Related pattern

Multi-pass matrix marking also appears in grid simulation and cellular automaton problems.
