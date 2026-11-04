# Deep Copy of an Undirected Graph

An undirected graph has nodes numbered from `1` to `n`. Its adjacency list is given as `adjacency`, where `adjacency[i]` contains the neighbors of node `i + 1` in arbitrary order. The graph may be disconnected, and an empty adjacency list represents a graph with no nodes.

Build a deep copy of the graph: every copied node must be a new object, and every copied edge must connect copied nodes rather than original ones. Then describe the copy in the same adjacency format, but sort each neighbor list in ascending order. Return the sorted adjacency list of the copied graph.

Because node labels are preserved by position, the returned list should have the same length as the input, with `result[i]` describing copied node `i + 1`.

## Input

- `adjacency`: an adjacency list using nodes numbered from `1` to `n`.

## Output

The sorted adjacency list of the deep copy.

## Examples

**Example 1**

```
Input: adjacency = [[2], [1]]
Output: [[2], [1]]
```

**Example 2**

```
Input: adjacency = [[]]
Output: [[]]
```

A single node with no edges still has a copied counterpart.

**Example 3**

```
Input: adjacency = []
Output: []
```

**Example 4**

```
Input: adjacency = [[2, 3], [1], [1]]
Output: [[2, 3], [1], [1]]
```

## Constraints

- `0 <= adjacency.length <= 100`
- The graph is simple: no self-loops and no repeated edges.
- The adjacency lists are consistent with an undirected graph.
- The total number of neighbor entries is at most 2000.
- Node labels that appear are between `1` and `adjacency.length`.

## Notes

The sorted order is canonical even when the input lists are shuffled.
