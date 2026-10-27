# Center Roots

An undirected tree has `n` nodes labeled from `0` to `n - 1`, described by its edges. Choosing a node as the root gives the tree a height.

Return every label that can be the root of a minimum-height tree. The labels should be sorted in ascending order.

## Input

- `n`: the number of nodes.
- `edges`: the `n - 1` undirected edges.

## Output

All labels that produce minimum height, sorted ascending.

## Examples

**Example 1**

```
Input: n = 4, edges = [[1,0],[1,2],[1,3]]
Output: [1]
```

**Example 2**

```
Input: n = 6, edges = [[3,0],[3,1],[3,2],[3,4],[5,4]]
Output: [3,4]
```

**Example 3**

```
Input: n = 1, edges = []
Output: [0]
```

## Constraints

- `1 <= n <= 20,000`
- `edges.length == n - 1`
- The edges form a valid tree.
- All edges connect distinct labels in `[0, n - 1]`.

## Follow-up

Why are there at most two minimum-height roots, and how does leaf peeling reveal them?
