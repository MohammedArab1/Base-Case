# Explanation

## Key insight

This is a shortest-path problem on an unweighted grid with many sources. Starting a breadth-first search from every zero at once computes all distances in one traversal.

## Algorithm

1. Create a distance grid filled with `-1`.
2. Set every zero cell to distance `0` and enqueue it.
3. Pop cells in queue order and inspect their four edge-neighbors.
4. Give each unvisited neighbor the current distance plus one and enqueue it.
5. Return the distance grid.

## Correctness

The queue processes cells in nondecreasing distance because each edge adds one. When a cell is first reached, it is reached through a shortest path from some zero; if a shorter path existed, that path's predecessor would have been processed earlier. Thus every recorded distance is minimal.

## Complexity

- Time: `O(m * n)`, since each cell enters the queue once.
- Space: `O(m * n)` for the queue and distance grid.

## Common mistakes

- Running a separate search from each cell, which is far too slow.
- Replacing a distance when a later path is seen.
- Treating diagonal moves as one step.
- Forgetting cells that are already zero.

## Related pattern

Multi-source BFS also solves problems such as rotting fruit and wall gates.
