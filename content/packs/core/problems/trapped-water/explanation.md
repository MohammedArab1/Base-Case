# Explanation

## Key insight

Water above a position is bounded by the shorter of the two surrounding maxima. Processing the shorter pointer side first guarantees that the opposite side has a bar at least as tall, so the current side's maximum is the limiting level.

## Algorithm

1. Start pointers at both ends with both maxima at zero.
2. Move the pointer at the shorter bar.
3. Update that side's maximum.
4. Add the difference between the maximum and the current height.
5. Return the accumulated water.

## Correctness

When the left bar is shorter, `rightMax` is at least `heights[right]`, which is greater than the current left height, so the water level on the left is determined by `leftMax`. The symmetric argument holds when the right bar is shorter. Every position is processed once with the correct limiting level.

## Complexity

- Time: `O(n)`.
- Space: `O(1)`.

## Common mistakes

- Adding water above the tallest bar.
- Updating the maximum after adding water.
- Using the wrong side's maximum.

## Related pattern

Precomputing prefix and suffix maxima gives the same answer with `O(n)` extra space.
