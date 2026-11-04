# Row and Column Search

A rectangular table of integers is sorted in two directions: values never decrease as you move right along a row, and values never decrease as you move down a column. Given such a table and a target integer, determine whether the target appears at least once.

An empty table contains no values. If the table contains at least one value, all rows have the same length.

## Input

- `matrix`: a rectangular `int[][]` sorted as described, possibly empty.
- `target`: the integer to find.

## Output

Return `true` if `target` occurs in `matrix`, and `false` otherwise.

## Examples

**Example 1**

```
Input: matrix = [[2, 5, 9], [12, 15, 19], [21, 26, 30]], target = 15
Output: true
```

**Example 2**

```
Input: matrix = [[2, 5, 9], [12, 15, 19], [21, 26, 30]], target = 14
Output: false
```

**Example 3**

```
Input: matrix = [[-4, -2], [0, 3]], target = -4
Output: true
```

**Example 4**

```
Input: matrix = [], target = 7
Output: false
```

## Constraints

- `0 <= matrix.length <= 500`
- `0 <= matrix[i].length <= 500`
- `-1,000,000,000 <= matrix[i][j] <= 1,000,000,000`
- `-1,000,000,000 <= target <= 1,000,000,000`
- Every row is non-decreasing from left to right.
- Every column is non-decreasing from top to bottom.
- If the table is non-empty, all rows have the same length.

## Follow-up

Can you do it in `O(rows + columns)` time and `O(1)` extra space?
