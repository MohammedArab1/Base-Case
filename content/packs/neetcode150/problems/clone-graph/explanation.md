# Explanation

## Approach

First build an in-memory node for each adjacency position, then connect those original nodes according to the input. A recursive clone visits an original node, creates its copy if needed, records the copy in a map keyed by label, and recursively clones every neighbor. Starting the clone from every node covers disconnected components.

After all copies exist, serialize them into a new adjacency list. Each neighbor list is sorted before being stored.

## Correctness

The map ensures there is exactly one copy per original node. When an edge is considered, both endpoints have copies, so the copied edge connects copies rather than originals. Recursion follows every edge in every component, so no node or edge is omitted. Since labels are preserved, position `i` in the output describes the copy of node `i + 1`. Sorting each list produces the required canonical representation.

## Complexity

Let `V` be the number of nodes and `E` the number of undirected edges.

- Time: `O(V + E + E log E)`, where the sorting dominates for high-degree nodes.
- Space: `O(V + E)` for nodes, edges, the label map, and recursion.

## Common mistakes

- Returning the original adjacency without creating copies.
- Creating multiple copies of a node reached by different edges.
- Traversing only one connected component.
- Forgetting isolated nodes.
- Returning neighbor lists in input order instead of sorted order.
