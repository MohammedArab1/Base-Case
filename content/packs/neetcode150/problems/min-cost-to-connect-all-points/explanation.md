# Explanation

## Approach

The settlements and all possible roads form a complete weighted graph. A minimum-cost connected network is a minimum spanning tree (MST).

Use Prim's algorithm. Keep a `best` value for each settlement: the cheapest road from that settlement to the part of the tree built so far. Initially `best[0] = 0` and every other value is infinity. On each of `n` rounds, select the unvisited settlement with the smallest `best` value, add that value to the answer, mark it visited, and update every unvisited settlement with its Manhattan distance to the newly added one.

Because the graph is complete, the distances are computed on demand and no edge list is needed.

## Correctness

The standard cut property of minimum spanning trees says that for any partition of the vertices, a minimum-weight edge crossing the partition belongs to some MST. At each round, the visited set and the unvisited set form a cut. Prim picks the lightest edge crossing that cut, because `best[v]` is the lightest edge from `v` to the visited set. Thus every selected edge can be part of an MST, and the result after `n - 1` selections is a spanning tree of minimum total weight.

## Complexity

- Time: `O(n^2)` for scanning the `best` array and updating distances on each of `n` rounds.
- Space: `O(n)` for the `best` and `visited` arrays.

## Common mistakes

- Using Euclidean distance or squaring distances instead of Manhattan distance.
- Forgetting that `best[0]` starts at zero and adding an artificial edge cost.
- Updating distances for already visited settlements.
- Assuming points are distinct or that duplicate coordinates add cost.
