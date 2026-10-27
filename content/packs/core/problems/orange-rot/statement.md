# Orange Rot

A grid describes a crate of oranges:

- `0` is an empty cell;
- `1` is a fresh orange;
- `2` is a rotten orange.

Every minute, each fresh orange that shares an edge with a rotten orange becomes rotten. Return how many minutes pass until no fresh oranges remain, or `-1` if that never happens. If there are no fresh oranges initially, return `0`.

## Input

- `grid`: a rectangular grid of `0`, `1`, and `2` values.

## Output

The number of minutes, or `-1`.

## Examples

**Example 1**

```
Input: grid = [[2,1,1],[1,1,0],[0,1,1]]
Output: 4
```

**Example 2**

```
Input: grid = [[2,1,1],[0,1,1],[1,0,1]]
Output: -1
```

The bottom-left orange is isolated.

**Example 3**

```
Input: grid = [[0,2]]
Output: 0
```

There are no fresh oranges.

## Constraints

- `1 <= grid.length, grid[0].length <= 1,000`
- Every cell is `0`, `1`, or `2`.

## Follow-up

Why is a multi-source breadth-first search the natural fit?
