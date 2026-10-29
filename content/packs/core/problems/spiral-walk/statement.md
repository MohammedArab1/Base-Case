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
Input: grid = [[4, 9, 2], [7, 1, 6], [5, 8, 3]]
Output: [4, 9, 2, 6, 3, 8, 5, 7, 1]
```

**Example 2**

```
Input: grid = [[11, 12, 13, 14], [20, 21, 22, 15], [19, 18, 17, 16]]
Output: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
```

**Example 3**

```
Input: grid = [[8]]
Output: [8]
```

**Example 4**

```
Input: grid = [[3, 5, 7]]
Output: [3, 5, 7]
```

A single row is visited once, left to right.

**Example 5**

```
Input: grid = [[6], [4], [2]]
Output: [6, 4, 2]
```

A single column is visited once, top to bottom.

## Constraints

- `0 <= number of rows <= 100`
- `0 <= number of columns <= 100`
- `-1,000,000,000 <= grid[i][j] <= 1,000,000,000`

## Follow-up

How would you produce a matrix filled in spiral order instead of reading one?
