# Island Count

You are given a rectangular grid of `0`s and `1`s. A `1` is land, and a `0` is water. Two land cells belong to the same island when they are connected horizontally or vertically. Diagonal cells are **not** connected.

Return the number of islands in the grid. An empty grid has no islands.

## Input

- `grid`: a rectangular list of rows, where each value is `0` or `1`.

## Output

The number of connected land regions.

## Examples

**Example 1**

```
Input: grid = [
  [1, 1, 0, 1],
  [0, 1, 0, 0],
  [1, 0, 0, 1]
]
Output: 4
```

The two cells in the first column are connected vertically; the other three land cells are isolated.

**Example 2**

```
Input: grid = [
  [1, 1, 1],
  [1, 1, 1]
]
Output: 1
```

**Example 3**

```
Input: grid = [
  [0, 0],
  [0, 0]
]
Output: 0
```

**Example 4**

```
Input: grid = [[1, 0, 1, 1, 0, 1]]
Output: 3
```

**Example 5**

```
Input: grid = [[1]]
Output: 1
```

## Constraints

- `0 <= rows, cols <= 300`
- Each cell is `0` or `1`.

## Follow-up

What changes if diagonal connections also count as part of the same island?
