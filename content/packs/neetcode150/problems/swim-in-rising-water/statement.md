# Rising Water Crossing

A hiker stands at the top-left cell of a square valley at dawn. The valley is described by an `n x n` grid, where `grid[r][c]` is the elevation of that cell. Water rises steadily, and at time `t` the water level is `t`. A cell can be entered only when its elevation is at most `t`. The hiker can move one cell up, down, left, or right per step, taking no additional time.

Return the earliest time `t` at which the hiker can travel from the top-left cell to the bottom-right cell.

## Input

- `grid`: an `n x n` matrix of nonnegative elevations.

## Output

Return the smallest water level that allows a path from `grid[0][0]` to `grid[n-1][n-1]`.

## Examples

**Example 1**

```
Input: grid = [[1, 4], [2, 3]]
Output: 3
```

At time 2 the hiker can reach the bottom-left cell, but the bottom-right cell has elevation 3, so time 3 is needed.

**Example 2**

```
Input: grid = [[5, 4, 3], [6, 1, 2], [7, 8, 9]]
Output: 9
```

The hiker follows the low cells around the center and must wait for the final high cell.

**Example 3**

```
Input: grid = [[10]]
Output: 10
```

A single cell is already accessible at its own elevation.

**Example 4**

```
Input: grid = [[0, 4, 1], [2, 3, 9], [5, 8, 6]]
Output: 8
```

The route through the upper-right corner is blocked by high ground, so the low route around the bottom is required.

## Constraints

- `1 <= n <= 50`
- `0 <= grid[r][c] <= 1,000,000`
- All elevations in the grid are distinct.
- The hiker may revisit cells, but a path that never revisits is always sufficient.

## Follow-up

How would you return one path that achieves the minimum time, not just the time itself?
