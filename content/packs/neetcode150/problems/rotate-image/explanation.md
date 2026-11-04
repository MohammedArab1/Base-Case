## Approach

Create a new `n x n` result matrix. For every cell `(r, c)` in the original matrix, compute its destination under a clockwise quarter turn: row `c`, column `n - 1 - r`. Assign the original value to that destination.

Using a fresh matrix avoids overwriting values that still need to be read. The destination mapping visits every cell exactly once, so the result is fully filled.

## Correctness

A clockwise quarter turn sends the top row to the right column, the right column to the bottom row, the bottom row to the left column, and the left column to the top row. The formula `(r, c) -> (c, n - 1 - r)` captures exactly that movement: the column index becomes the new row, and the row index is reflected to become the new column. Since every source cell is copied once and the mapping is a bijection on the `n^2` cells, the resulting matrix is precisely the rotated matrix.

## Complexity

- Time: `O(n^2)`, because every cell is visited once.
- Space: `O(n^2)` for the returned matrix.

## Common mistakes

- Rotating counter-clockwise by using the wrong column reflection.
- Writing into the input and overwriting cells before they are read.
- Forgetting the `n - 1` offset.
- Returning a jagged matrix for a rectangular input, which cannot occur under the constraints.

## Related pattern

Coordinate transformations are also used for transposes, reflections, and spiral traversals.
