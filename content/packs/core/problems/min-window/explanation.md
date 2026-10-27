# Explanation

## Key insight

A sliding window can maintain whether the current range covers the target. Once it does, shrinking from the left can only improve the length until coverage is lost.

## Algorithm

1. Count the target letters and the number of distinct letters required.
2. Expand the right edge one character at a time.
3. When every requirement is met, record and then shrink the left edge.
4. Stop shrinking when a required letter drops below its needed count.
5. Return the best recorded window.

## Correctness

For each right edge, the algorithm shrinks to the smallest window ending there that still covers the target. Any covering window ending at that position is at least as long. Taking the minimum over all right edges therefore finds the global shortest window. Strict improvement keeps the earliest start when lengths tie.

## Complexity

- Time: `O(n + m)`.
- Space: `O(1)` for the 26-letter tables.

## Common mistakes

- Comparing sets of letters instead of multiplicities.
- Shrinking before checking the best window.
- Updating the best on equal length, which loses the earliest start.

## Related pattern

The same expand-and-shrink window solves longest-substring-without-repeats.
