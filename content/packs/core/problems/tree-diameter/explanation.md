# Explanation

## Key insight

Every path has a highest node. Its length is the sum of the longest downward distances into that node's left and right subtrees.

## Algorithm

1. Traverse the tree post-order.
2. Measure the left and right subtree heights.
3. Update the best diameter with `left + right`.
4. Return `1 + max(left, right)` as the node's height.

## Correctness

For every node, the longest path whose highest point is that node uses the deepest node in each subtree, giving `left + right` edges. Taking the maximum over all nodes therefore considers every possible path. The returned height is the longest downward path, which lets parents combine their children correctly.

## Complexity

- Time: `O(n)`.
- Space: `O(n)` for the iterative traversal.

## Common mistakes

- Assuming the diameter must pass through the root.
- Counting nodes instead of edges.
- Returning the height as the diameter.

## Related pattern

The same bottom-up heights support balance checks and maximum path sums.
