# Explanation

## Approach

First reject any graph whose edge count differs from `n - 1`. Then process the edges with a disjoint-set union structure. If an edge connects two nodes that already share a component, it creates a cycle and the answer is false. Otherwise union the components. If no cycle is found, the edge count guarantees that the graph is connected.

## Correctness

A tree on `n` nodes has exactly `n - 1` edges, so the early rejection is valid. When the count is `n - 1`, a cycle and a disconnected component must occur together: a cycle wastes an edge that could have connected a separate component. The union-find detects exactly those cycle-creating edges. If none exists, the graph is acyclic; with `n - 1` edges and no cycle, it must be connected, hence a tree. If a cycle exists, the algorithm rejects it. Self-loops immediately join a node to itself, and repeated edges eventually produce a cycle as well.

## Complexity

Let `n` be the node count and `m` the edge count.

- Time: `O(n + m α(n))` with path compression, effectively linear.
- Space: `O(n)` for the parent and size arrays.

## Common mistakes

- Accepting any graph with `n - 1` edges without checking for cycles.
- Checking connectivity but forgetting cycles.
- Mishandling self-loops.
- Treating repeated edges as harmless when they create a cycle.
- Forgetting the single-node tree, which has zero edges and is valid.
