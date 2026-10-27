# Explanation

## Key insight

The last move partitions every climbing order into two groups: orders ending in a one-step move and orders ending in a two-step move.

## Algorithm

1. Return `steps` for one or two steps.
2. Keep the number of ways for the previous two heights.
3. For each higher height, add the two previous values.
4. Return the final value.

## Correctness

Every valid order for `n` ends with either a one-step or a two-step move. Removing that move gives a unique valid order for `n - 1` or `n - 2`, and adding the move back is unique. The two groups are disjoint and cover all orders, so the recurrence counts them exactly.

## Complexity

- Time: `O(n)`.
- Space: `O(1)`.

## Common mistakes

- Starting the recurrence with the wrong base cases.
- Counting moves rather than orders.
- Using exponential recursion without memoization.

## Related pattern

This is the Fibonacci recurrence in a different setting.
