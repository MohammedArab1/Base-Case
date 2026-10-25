# Spiral Walk

A grid of integers must be read in a clockwise spiral, starting at the top-left cell. After finishing the top row, continue down the right edge, then across the bottom, then up the left edge, and keep spiraling inward.

Return the values in the order they are visited.

## Input

- `grid`: a rectangular matrix of integers. The grid may be empty.

## Output

A flat array of every value in clockwise spiral order. An empty grid returns an empty array.

## Examples

**Example 1**

```
Input: grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
Output: [1, 2, 3, 6, 9, 8, 7, 4, 5]
```

**Example 2**

```
Input: grid = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]
Output: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]
```

**Example 3**

```
Input: grid = [[1]]
Output: [1]
```

**Example 4**

```
Input: grid = [[1, 2]]
Output: [1, 2]
```

A single row is visited once, left to right.

**Example 5**

```
Input: grid = [[1], [2], [3]]
Output: [1, 2, 3]
```

A single column is visited once, top to bottom.

## Constraints

- `0 <= number of rows <= 100`
- `0 <= number of columns <= 100`
- `-1,000,000,000 <= grid[i][j] <= 1,000,000,000`

## Follow-up

How would you produce a matrix filled in spiral order instead of reading one?
