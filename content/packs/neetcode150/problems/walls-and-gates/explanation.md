# Explanation

## Approach

Run a multi-source breadth-first search. Copy the input grid, enqueue every gate, and expand outward. When an orthogonal neighbor still holds the unreachable sentinel, it has not been reached yet; set its distance to the current distance plus one and enqueue it.

Walls have value `-1` and are never equal to the sentinel, so they are automatically skipped. Gates and already visited rooms are skipped for the same reason.

## Correctness

Every gate starts at distance zero. Breadth-first search explores cells in nondecreasing distance from the set of gates, so the first time a room is discovered, the path used has minimum length. Once assigned, the room is no longer the sentinel and cannot be assigned again. Rooms never discovered have no path through non-wall cells to any gate, so they correctly remain at `2147483647`.

## Complexity

Let `R` and `C` be the grid dimensions.

- Time: `O(R * C)`, because each cell enters the queue at most once.
- Space: `O(R * C)` for the copied grid and the queue.

## Common mistakes

- Starting a separate BFS from each gate.
- Using a stack, which does not guarantee shortest distances.
- Overwriting gates or walls.
- Treating the sentinel as a normal reachable distance.
- Forgetting that unreachable rooms stay at `2147483647`.
