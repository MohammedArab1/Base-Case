# Explanation

## Approach

For any path, the earliest time it can be completed is the largest elevation on that path. The answer is therefore the minimum possible bottleneck value over all paths.

One way to find it is binary search on the water level. For a candidate level `t`, mark cells with elevation at most `t` as passable and run a four-direction breadth-first search from the start. If the destination is reachable, the answer is at most `t`; otherwise it is larger. The predicate is monotone, so binary search converges on the smallest feasible level.

The Python solution instead uses a minimax Dijkstra: each state stores the smallest possible maximum elevation along any path to that cell, and a priority queue expands the most promising state first.

## Correctness

A path is feasible at level `t` exactly when every cell on it has elevation at most `t`. Breadth-first search visits exactly the cells reachable through such paths, so the feasibility test is correct. Feasibility is monotone in `t`: raising the water never removes a passable cell. Binary search therefore returns the smallest feasible level.

For the minimax Dijkstra variant, the same monotonicity and the standard Dijkstra argument apply to the semiring `max` instead of `+`: popping the smallest bottleneck first finalizes that value, and relaxing a neighbor with the larger of the current bottleneck and the neighbor's elevation finds the best bottleneck for every cell.

## Complexity

- Binary-search version: `O(n^2 log C)`, where `C` is the range of elevations, and `O(n^2)` space.
- Minimax Dijkstra version: `O(n^2 log n)` time and `O(n^2)` space.
- The TypeScript solution uses binary search plus BFS.

## Common mistakes

- Summing elevations along a path instead of taking the maximum.
- Starting the search at time 0 even when the start cell is above 0.
- Allowing diagonal moves.
- Binary searching only over values present in the grid without handling the start and destination bounds correctly.
