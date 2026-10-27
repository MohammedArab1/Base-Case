# Explanation

## Key insight

Depth is the count of nodes from the root to the deepest leaf. Each child is exactly one level deeper than its parent.

## Algorithm

1. Return `0` for an empty tree.
2. Push the root with depth one.
3. Pop each node, update the best depth, and push existing children with depth plus one.
4. Return the best depth.

## Correctness

Every pushed node receives a depth equal to its actual distance from the root plus one. The traversal reaches every node, so the maximum recorded depth is the height of the tree.

## Complexity

- Time: `O(n)`.
- Space: `O(n)` for the traversal stack.

## Common mistakes

- Counting edges instead of nodes.
- Returning the smaller child depth.
- Forgetting the empty-tree case.

## Related pattern

The same traversal supports minimum depth and level-order output.
