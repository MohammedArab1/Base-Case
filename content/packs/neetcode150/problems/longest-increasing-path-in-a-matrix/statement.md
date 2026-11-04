# Uphill Path Length

A hiker explores a rectangular grid of elevations. From a cell the hiker may move one cell up, down, left, or right, but only to a cell with a strictly larger elevation. Cells may not be reused within one path.

Return the number of cells in the longest strictly increasing path. The grid contains at least one cell.

## Input

- `matrix`: a rectangular matrix of integer elevations.

## Output

Return the maximum number of cells in any strictly increasing four-direction path.

## Examples

**Example 1**

```
Input: matrix = [[9, 8, 7], [4, 5, 6], [3, 2, 1]]
Output: 9
```

The path 1, 2, 3, 4, 5, 6, 7, 8, 9 snakes through the grid and uses every cell.

**Example 2**

```
Input: matrix = [[4]]
Output: 1
```

A single cell is already a path of length 1.

**Example 3**

```
Input: matrix = [[1, 2], [3, 4]]
Output: 3
```

The longest path is 1, 2, 4 or 1, 3, 4, giving length 3.

**Example 4**

```
Input: matrix = [[5, 4], [3, 6]]
Output: 2
```

The longest increasing path has two cells.

## Constraints

- `1 <= matrix.length <= 100`
- `1 <= matrix[0].length <= 100`
- `-1,000,000,000 <= matrix[r][c] <= 1,000,000,000`
- All rows have the same length.

## Follow-up

How would the solution change if moves could also be diagonal?
