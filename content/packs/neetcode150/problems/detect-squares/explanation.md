## Approach

Store the distinct occupied coordinates in a hash set, which also removes duplicate points. For each query, first check whether its corner is occupied. Then try the four diagonal directions in which an axis-aligned square of the requested side can extend. For each direction, form the other three corners and check whether all of them are present. Count the directions that succeed.

## Correctness

An axis-aligned square with corner `(x, y)` and side `s` must extend a distance `s` in one horizontal direction and a distance `s` in one vertical direction. There are exactly four such combinations, corresponding to the four diagonal directions. The algorithm tests each combination exactly once. A count is incremented precisely when all four corners are in the occupied set, which is the definition of a valid square. Duplicate input points collapse in the set, so they cannot inflate the count.

## Complexity

- Time: `O(p + q)`, because building the set takes `O(p)` and each query performs a constant amount of work.
- Space: `O(p)` for the occupied set, plus the output.

## Common mistakes

- Forgetting to require the query corner itself to be present.
- Testing only one diagonal direction.
- Counting duplicate points as separate squares.
- Using squared side length instead of the requested side when forming corners.

## Related pattern

Hash-set lookups also speed up geometric checks such as rectangles, collinear points, and bounding boxes.
