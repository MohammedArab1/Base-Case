# Explanation

## Key insight

The right view is the rightmost node at each depth. A level-order traversal exposes every depth as a group, making the last node easy to select.

## Algorithm

1. Start with the root in a current-level list.
2. Record the value of the last node in the level.
3. Collect the children of all level nodes, left then right.
4. Continue until no nodes remain.

## Correctness

Each iteration processes exactly one depth in left-to-right order. The last node in that order is the rightmost node at that depth, so recording it produces the visible value. Every depth with at least one node is processed exactly once, giving the full top-to-bottom view.

## Complexity

- Time: `O(n)`.
- Space: `O(n)` for the widest level and the output.

## Common mistakes

- Recording the right child of every node, which can miss a deeper level.
- Reversing the level order and taking the first node.
- Forgetting an empty tree.

## Related pattern

The mirror image, the left view, uses the first node of each level.
