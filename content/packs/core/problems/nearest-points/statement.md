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
Input: points = [[5,2],[-3,4],[1,-6],[0,3]], k = 2
Output: [[0,3],[-3,4]]
```

Squared distances: `29`, `25`, `37`, and `9`.

**Example 2**

```
Input: points = [[7,0],[0,7],[3,4]], k = 1
Output: [[3,4]]
```

**Example 3**

```
Input: points = [[0,0]], k = 1
Output: [[0,0]]
```

**Example 4**

```
Input: points = [[1,2],[1,-2],[-1,2],[-1,-2]], k = 2
Output: [[-1,-2],[-1,2]]
```

All four points have squared distance `5`; ties use smaller `x`, then smaller `y`.

**Example 5**

```
Input: points = [[4,1],[-2,5],[3,-3],[0,0]], k = 3
Output: [[0,0],[4,1],[3,-3]]
```

## Constraints

- `1 <= k <= points.length <= 100,000`
- `-10,000 <= x, y <= 10,000`

## Follow-up

Can you avoid sorting every point when `k` is much smaller than `n`?
