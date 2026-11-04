# Ocean-Draining Cells

A rectangular island is described by a grid of nonnegative heights. The Pacific Ocean borders the top and left sides of the island. The Atlantic Ocean borders the bottom and right sides.

Rainwater at a cell can move to an adjacent cell (up, down, left, or right) when the neighbor's height is less than or equal to the current cell's height. Water that reaches any cell on an ocean border drains into that ocean.

Return every cell from which water can reach both oceans. Represent each cell as `[row, col]`, and sort the result by row ascending, then by column ascending. An empty grid has no such cells.

## Input

- `heights`: a rectangular grid of nonnegative heights.

## Output

The cells that drain to both oceans, in row-major order.

## Examples

**Example 1**

```
Input: heights = [
  [1, 2],
  [3, 4]
]
Output: [[0, 1], [1, 0], [1, 1]]
```

Cell `[0, 1]` touches both the top and right borders. Cell `[1, 0]` touches both the left and bottom borders. Cell `[1, 1]` touches both the right and bottom borders.

**Example 2**

```
Input: heights = [[5]]
Output: [[0, 0]]
```

**Example 3**

```
Input: heights = [
  [1, 1],
  [1, 1]
]
Output: [[0, 0], [0, 1], [1, 0], [1, 1]]
```

Equal heights allow water to move between all four cells.

## Constraints

- `0 <= heights.length <= 50`
- `0 <= heights[0].length <= 50`
- `0 <= heights[row][col] <= 1,000,000`
