# Quarter Turn

Given a square matrix of integers, produce a new matrix that is the original rotated 90 degrees clockwise.

Return the rotated matrix. The input matrix must not be modified.

## Input

- `matrix`: a square matrix with `n` rows and `n` columns.

## Output

A new `n x n` matrix whose rows are the columns of the original matrix taken from bottom to top.

## Notes

- In a clockwise quarter turn, the cell at row `r`, column `c` moves to row `c`, column `n - 1 - r`.
- Rows and columns are indexed from zero.

## Examples

**Example 1**

```
Input: matrix = [[2, 7, 5], [1, 4, 9], [6, 3, 8]]
Output: [[6, 1, 2], [3, 4, 7], [8, 9, 5]]
```

**Example 2**

```
Input: matrix = [[1]]
Output: [[1]]
```

**Example 3**

```
Input: matrix = [[4, 1], [8, 3]]
Output: [[8, 4], [3, 1]]
```

**Example 4**

```
Input: matrix = [[11, 12, 13, 14], [15, 16, 17, 18], [19, 20, 21, 22], [23, 24, 25, 26]]
Output: [[23, 19, 15, 11], [24, 20, 16, 12], [25, 21, 17, 13], [26, 22, 18, 14]]
```

## Constraints

- `1 <= n <= 50`
- `-1,000 <= matrix[r][c] <= 1,000`

## Follow-up

Can you perform the rotation in place using only O(1) additional space?
