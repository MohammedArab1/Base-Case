# Explanation

## Key insight

Each subtree reports two pieces of information to its parent: its height and whether it is balanced. Both can be computed bottom-up in one traversal.

## Algorithm

1. Traverse the tree post-order.
2. For a null node, report height `0` and balanced `true`.
3. Measure both children.
4. Report height `1 + max(left, right)`.
5. Report balanced only when both children are balanced and the height difference is at most one.

## Correctness

By induction, each child reports its true height and balance status. The parent's height follows directly from the definition, and its balance condition checks exactly the two child heights. Therefore the root's status is correct for the entire tree.

## Complexity

- Time: `O(n)`.
- Space: `O(n)` for the iterative traversal stack in the worst case.

## Common mistakes

- Checking only the root's two subtree heights.
- Recomputing heights for every node, which becomes quadratic.
- Using the number of edges for one subtree and nodes for another.

## Related pattern

Tree diameter uses the same bottom-up height calculation with an extra global maximum.
