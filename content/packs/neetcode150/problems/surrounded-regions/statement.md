# Captured Enclosed Regions

A rectangular board contains cells marked `"X"` or `"O"`. An `"O"` region is a group of `"O"` cells connected horizontally or vertically.

Any `"O"` region that touches the border of the board can reach the outside and survives. Every other `"O"` region is enclosed and must be captured, which means changing all of its cells to `"X"`.

Return a new board with the captured regions flipped. Leave `"X"` cells and surviving border-connected `"O"` cells unchanged. The input board must not be modified.

## Input

- `board`: a rectangular list of rows containing `"X"` and `"O"`.

## Output

The board after capturing enclosed regions.

## Examples

**Example 1**

```
Input: board = [
  ["X", "X", "X"],
  ["X", "O", "X"],
  ["X", "X", "X"]
]
Output: [
  ["X", "X", "X"],
  ["X", "X", "X"],
  ["X", "X", "X"]
]
```

The center region is enclosed.

**Example 2**

```
Input: board = [
  ["X", "X", "X", "X", "X"],
  ["X", "O", "O", "O", "X"],
  ["X", "O", "X", "O", "X"],
  ["X", "O", "O", "O", "X"],
  ["X", "X", "X", "X", "O"]
]
Output: [
  ["X", "X", "X", "X", "X"],
  ["X", "X", "X", "X", "X"],
  ["X", "X", "X", "X", "X"],
  ["X", "X", "X", "X", "X"],
  ["X", "X", "X", "X", "O"]
]
```

The ring of `"O"` cells is enclosed, while the bottom-right `"O"` touches the border.

**Example 3**

```
Input: board = [
  ["O", "O"],
  ["O", "O"]
]
Output: [
  ["O", "O"],
  ["O", "O"]
]
```

Every cell touches the border.

## Constraints

- `0 <= board.length <= 50`
- `0 <= board[0].length <= 50`
- Every cell is `"X"` or `"O"`.
- An empty board produces an empty board.
