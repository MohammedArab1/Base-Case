# Largest Connected Landmass

You are given a rectangular map of `0`s and `1`s, where `1` is land and `0` is water. Land cells connect when they share an edge horizontally or vertically; diagonal contact does not count.

Return the number of cells in the largest connected land region. If the map has no land, return `0`.

## Input

- `grid`: a rectangular list of rows containing `0` and `1`.

## Output

The area of the largest connected land region.

## Examples

**Example 1**

```
Input: grid = [
  [1, 1, 0],
  [0, 1, 0],
  [1, 0, 1]
]
Output: 3
```

The upper-left region contains three cells. The two remaining land cells are isolated.

**Example 2**

```
Input: grid = [
  [1, 1, 1],
  [1, 1, 1]
]
Output: 6
```

**Example 3**

```
Input: grid = [
  [0, 0],
  [0, 0]
]
Output: 0
```

## Constraints

- `0 <= grid.length <= 50`
- `0 <= grid[0].length <= 50`
- Every cell is `0` or `1`.
