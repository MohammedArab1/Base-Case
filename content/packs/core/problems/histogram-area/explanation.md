# Explanation

## Key insight

A rectangle of height `h` can use every consecutive bar at least `h` tall. The best rectangle for a bar extends to the nearest shorter bars on its left and right.

## Algorithm

1. Scan indices with a stack of increasing heights.
2. Append a sentinel height of zero to flush the stack.
3. When the current height is smaller than the stack top, pop the taller bar.
4. Its width is bounded by the new stack top and the current index.
5. Update the best area.

## Correctness

The stack always holds indices with nondecreasing heights. When a bar is popped, the current index is the first shorter bar on its right, and the new stack top is the nearest bar on its left with height less than or equal to the popped bar. Equal-height bars are popped later and produce the wider candidate. The width between those boundaries is the widest rectangle using that bar's height. Every bar is popped once, so every candidate rectangle is considered.

## Complexity

- Time: `O(n)`.
- Space: `O(n)`.

## Common mistakes

- Forgetting the sentinel, leaving bars unprocessed.
- Computing width as `index - bar` instead of excluding the boundaries.
- Using a decreasing instead of increasing stack.

## Related pattern

The same monotonic stack finds next-greater and next-smaller elements.
