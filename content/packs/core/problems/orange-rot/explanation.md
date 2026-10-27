# Explanation

## Key insight

Rot spreads in waves from every initially rotten orange at the same time. Level-by-level breadth-first search models those minutes directly.

## Algorithm

1. Enqueue every rotten cell and count fresh cells.
2. While the queue is non-empty and fresh cells remain, process exactly the current queue size.
3. For each cell, turn adjacent fresh cells rotten, decrement the fresh count, and enqueue them.
4. Increment the minute count after each wave.
5. Return the minute count when no fresh cells remain, otherwise `-1`.

## Correctness

At the start of each wave, the queue contains exactly the oranges that became rotten in the previous minute. Thus every cell reached in wave `k` has distance `k` from some initial rotten cell, which is the earliest minute it can rot. Processing whole waves prevents newly rotten oranges from spreading too early. If fresh cells remain after the queue empties, they are unreachable.

## Complexity

- Time: `O(m * n)`.
- Space: `O(m * n)` for the queue.

## Common mistakes

- Incrementing the minute count per cell instead of per wave.
- Spreading from newly rotten cells in the same minute.
- Forgetting to return `0` when there are no fresh oranges.
- Counting an isolated fresh orange as reachable.

## Related pattern

This is the same wave propagation used by multi-source distance problems.
