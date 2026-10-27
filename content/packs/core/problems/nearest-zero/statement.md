# Nearest Zero

A grid contains only `0` and `1`. At least one cell is `0`. For every cell, find the distance to the nearest `0`, where distance is the number of edge steps between cells.

Return a grid of the same size containing those distances.

## Input

- `grid`: a rectangular grid of `0` and `1` values.

## Output

A grid where each cell is its distance to the nearest zero.

## Examples

**Example 1**

```
Input: grid = [[0,0,0],[0,1,0],[0,0,0]]
Output: [[0,0,0],[0,1,0],[0,0,0]]
```

**Example 2**

```
Input: grid = [[0,0,0],[0,1,0],[1,1,1]]
Output: [[0,0,0],[0,1,0],[1,2,1]]
```

**Example 3**

```
Input: grid = [[1,1,1],[1,1,0]]
Output: [[3,2,1],[2,1,0]]
```

## Constraints

- `1 <= grid.length, grid[0].length <= 1,000`
- Every cell is `0` or `1`.
- At least one cell is `0`.

## Follow-up

Why is a single breadth-first search from all zeros faster than running one search per cell?
