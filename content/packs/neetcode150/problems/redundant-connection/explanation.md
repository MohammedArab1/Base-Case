# Explanation

## Approach

Process the edges in the given order with a disjoint-set union structure. Initially every node is its own component. For each edge, find the roots of its endpoints. If the roots differ, union the components. If they are already equal, the edge closes a cycle, so return that edge.

## Correctness

Before the cycle-closing edge is processed, all earlier edges form a forest, because no earlier edge joined two nodes already in one component. The first edge that joins two nodes in the same component therefore creates the graph's unique cycle. In a connected graph with exactly one cycle, removing any cycle edge yields a tree; because the cycle-closing edge is the last cycle edge in input order, it matches the tie-breaking rule. Any later edge must be outside the cycle, since the unique cycle already exists and the graph remains unicyclic; removing such a tree edge would disconnect the graph. Hence the returned edge is exactly the required one.

## Complexity

Let `n` be the number of edges and nodes.

- Time: `O(n α(n))` with path compression and union by size, effectively linear.
- Space: `O(n)` for the parent and size arrays.

## Common mistakes

- Returning the first cycle edge found by naive cycle detection instead of the last cycle edge in input order.
- Unioning before checking whether the endpoints already share a component.
- Forgetting path compression, which can make repeated finds slow.
- Returning the labels sorted instead of preserving the input orientation.
