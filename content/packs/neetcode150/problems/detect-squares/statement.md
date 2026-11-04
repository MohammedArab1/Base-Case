# Square Counter

Points on an integer grid are given, possibly with duplicates. Each query `[x, y, side]` asks how many axis-aligned squares of side length `side` have `(x, y)` as a corner and all four corners among the given points.

Repeating a point does not create extra squares, and the query corner must itself be present. Return one count per query, in query order.

## Input

- `points`: the occupied grid coordinates.
- `queries`: each entry is `[x, y, side]`, where `side >= 1`.

## Output

An array of counts, one per query, in the same order as `queries`.

## Notes

- A square is axis-aligned: its sides are parallel to the coordinate axes.
- From a given corner and side length, there are four diagonal directions in which the square can extend.
- The output order is canonical and follows the original query order.

## Examples

**Example 1**

```
Input: points = [[0, 0], [1, 0], [0, 1], [1, 1]], queries = [[0, 0, 1]]
Output: [1]
```

**Example 2**

```
Input: points = [[0, 0], [1, 0], [0, 1], [1, 1]], queries = [[2, 2, 1]]
Output: [0]
```

**Example 3**

```
Input: points = [[0, 0], [2, 0], [0, 2], [2, 2], [-2, 0], [0, -2], [-2, -2]], queries = [[0, 0, 2], [0, 0, 1]]
Output: [2, 0]
```

**Example 4**

```
Input: points = [[0, 0], [0, 0], [1, 0], [0, 1], [1, 1]], queries = [[0, 0, 1]]
Output: [1]
```

## Constraints

- `0 <= points.length <= 1,000`
- `1 <= queries.length <= 1,000`
- `-1,000,000,000 <= x, y <= 1,000,000,000` for points and query corners
- `1 <= side <= 1,000,000,000`

## Follow-up

How would you support a stream of point insertions and count queries efficiently?
