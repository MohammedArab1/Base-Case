# Explanation

## Key insight

A leaf cannot be a minimum-height root unless the tree is tiny. Repeatedly removing leaves moves inward to the tree's center, which is one node or one edge.

## Algorithm

1. Build adjacency sets and degree counts.
2. Put every node with degree at most one into a leaf queue.
3. While more than two nodes remain, remove the entire current leaf layer and collect newly exposed leaves.
4. Return the remaining labels in sorted order.

## Correctness

Removing a leaf cannot change which deeper node is the center; it only shortens the outer layer. Each layer removal reduces the maximum distance from the center by one. The process stops when one or two nodes remain, which are exactly the middle of the longest path and therefore the roots of minimum-height trees.

## Complexity

- Time: `O(n)`.
- Space: `O(n)`.

## Common mistakes

- Peeling one leaf at a time instead of a whole layer.
- Forgetting the single-node tree.
- Returning the first leaf layer instead of the final one.

## Related pattern

Leaf peeling also finds the center of a tree for diameter problems.
