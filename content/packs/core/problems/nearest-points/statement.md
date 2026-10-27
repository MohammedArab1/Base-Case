# Nearest Points

Given points on a two-dimensional plane, return the `k` points closest to the origin.

Distance is measured with squared Euclidean distance, so the point `[x, y]` has distance `x*x + y*y`. Return the selected points ordered by distance. Break ties by smaller `x`, then smaller `y`.

## Input

- `points`: distinct or repeated integer coordinates.
- `k`: how many points to return.

## Output

A list of exactly `k` points in the order described above.

## Examples

**Example 1**

```
Input: points = [[1,3],[-2,2]], k = 1
Output: [[-2,2]]
```

**Example 2**

```
Input: points = [[3,3],[5,-1],[-2,4]], k = 2
Output: [[3,3],[-2,4]]
```

Their squared distances are `18`, `26`, and `20`.

**Example 3**

```
Input: points = [[1,1],[0,1],[1,0]], k = 2
Output: [[0,1],[1,0]]
```

The last two points tie on distance, so the smaller `x` comes first.

## Constraints

- `1 <= k <= points.length <= 100,000`
- `-10,000 <= x, y <= 10,000`

## Follow-up

Can you avoid sorting every point when `k` is much smaller than `n`?
