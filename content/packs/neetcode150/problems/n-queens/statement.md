# Non-Attacking Queens Count

On an `n x n` chessboard, place exactly `n` queens so that no two queens attack each other. Queens attack along rows, columns, and both diagonals. Return the number of distinct placements.

The placement of a queen is determined by its row and column, so two placements are different when any queen occupies a different square.

## Input

- `n`: the board size.

## Output

The number of valid placements. If `n` is zero, return `0`.

## Examples

**Example 1**

```
Input: n = 4
Output: 2
```

Two placements exist on a 4 by 4 board.

**Example 2**

```
Input: n = 6
Output: 4
```

**Example 3**

```
Input: n = 1
Output: 1
```

## Constraints

- `0 <= n <= 13`
