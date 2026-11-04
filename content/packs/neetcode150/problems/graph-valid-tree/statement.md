# Tree or Not

An undirected graph has `n` nodes labeled from `0` to `n - 1` and a list of edges. Determine whether the graph is a tree.

A tree is connected and contains no cycles. Equivalently, a valid tree on `n` nodes has exactly `n - 1` edges and no cycle. The graph may be disconnected, and edges are undirected.

## Input

- `n`: the number of nodes.
- `edges`: a list of two-element arrays `[u, v]` describing undirected edges.

## Output

`true` if the graph is a tree, otherwise `false`.

## Examples

**Example 1**

```
Input: n = 5, edges = [[0, 1], [0, 2], [0, 3], [3, 4]]
Output: true
```

**Example 2**

```
Input: n = 3, edges = [[0, 1], [1, 2], [2, 0]]
Output: false
```

The graph is connected but contains a cycle.

**Example 3**

```
Input: n = 4, edges = [[0, 1], [2, 3]]
Output: false
```

The graph is disconnected.

## Constraints

- `1 <= n <= 500`
- `0 <= edges.length <= 2000`
- Each endpoint is between `0` and `n - 1`.
- Self-loops and repeated edges are allowed in the input and make the answer `false`.
