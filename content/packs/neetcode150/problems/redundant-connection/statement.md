# Edge to Break the Cycle

A graph with nodes labeled `1` through `n` started as a tree, and then exactly one additional edge was inserted. The result is connected and contains exactly one cycle. Node count equals the number of edges.

You are given all edges in the order they were inserted, where each edge is `[u, v]` and is undirected. Removing any edge on the cycle restores a tree. If more than one edge could be removed, return the edge that appears last in the input. Preserve the orientation in which that edge appears.

## Input

- `edges`: a list of undirected edges, given as two-element arrays.

## Output

The edge to remove, in the same orientation as it appears in `edges`.

## Examples

**Example 1**

```
Input: edges = [[1, 2], [2, 3], [3, 4], [2, 4]]
Output: [2, 4]
```

**Example 2**

```
Input: edges = [[1, 2], [2, 3], [3, 4], [4, 5], [2, 5], [4, 6]]
Output: [2, 5]
```

Edges `[2,3]`, `[3,4]`, `[4,5]`, and `[2,5]` form the cycle. `[2,5]` is the last of them in the input.

**Example 3**

```
Input: edges = [[3, 1], [1, 2], [2, 3]]
Output: [2, 3]
```

## Constraints

- `3 <= edges.length <= 1000`
- The graph is connected and contains exactly one cycle.
- Every node label is between `1` and `edges.length`.
- There are no self-loops or parallel edges.

## Notes

Removing a tree edge would disconnect the graph, so only cycle edges are candidates.
