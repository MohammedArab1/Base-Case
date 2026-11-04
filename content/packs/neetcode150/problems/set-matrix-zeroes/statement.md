# Zero Rows and Columns

Given a rectangular matrix, return a new matrix in which every row that contained a `0` and every column that contained a `0` are filled with zeros.

The zero positions must be determined from the original matrix. A zero created while filling rows and columns must not spread to additional rows or columns.

## Input

- `matrix`: a rectangular matrix with at least one row and one column.

## Output

A new matrix of the same dimensions after clearing every affected row and column.

## Notes

- The input matrix must not be modified.
- Only original zero entries determine which rows and columns are cleared.

## Examples

**Example 1**

```
Input: matrix = [[1, 2, 3], [4, 0, 6], [7, 8, 9]]
Output: [[1, 0, 3], [0, 0, 0], [7, 0, 9]]
```

**Example 2**

```
Input: matrix = [[0, 2], [3, 4]]
Output: [[0, 0], [0, 4]]
```

**Example 3**

```
Input: matrix = [[1, 2], [3, 4]]
Output: [[1, 2], [3, 4]]
```

**Example 4**

```
Input: matrix = [[0]]
Output: [[0]]
```

## Constraints

- `1 <= number of rows <= 50`
- `1 <= number of columns <= 50`
- `-1,000,000,000 <= matrix[r][c] <= 1,000,000,000`

## Follow-up

Can you mark the affected rows and columns using only the first row and first column of the matrix as storage?
