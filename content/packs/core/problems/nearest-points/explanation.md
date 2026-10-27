# Explanation

## Key insight

Comparing squared distances is equivalent to comparing distances because both values are non-negative. A total ordering with coordinate tie-breakers makes the output deterministic.

## Algorithm

1. Compute `x*x + y*y` for every point.
2. Sort by `(distance, x, y)`.
3. Return the first `k` points.

## Correctness

The sort places every point in nondecreasing distance. Points with equal distance are ordered by the stated tie-breakers. Taking a prefix of length `k` therefore returns exactly the `k` nearest points in the required order.

## Complexity

- Time: `O(n log n)` for sorting.
- Space: `O(n)` for the sorted copy.

## Common mistakes

- Using square roots and introducing floating-point error.
- Ignoring the tie-breakers, which makes the output order ambiguous.
- Forgetting that repeated points are allowed.

## Related pattern

A bounded max-heap reduces the time to `O(n log k)` when `k` is small.
