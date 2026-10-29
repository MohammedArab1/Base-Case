# Explanation

## Key insight

Checking only a node against its children is not enough. A value deep in a left subtree must be smaller than every ancestor for which that subtree is on the left, not just smaller than its parent. Carrying an allowed open interval down the traversal captures all of those constraints at once.

## Algorithm

1. Start with the root and the interval `(-infinity, +infinity)` on a stack.
2. Pop a node; reject it if its value is less than or equal to the lower bound, or greater than or equal to the upper bound.
3. Push the left child with the same lower bound and the node's value as the new upper bound.
4. Push the right child with the node's value as the new lower bound and the same upper bound.
5. An empty tree is valid; an empty stack means every node passed.

## Correctness

The interval at a node is exactly the set of values that would satisfy every ancestor relationship on the path to that node. A value outside the interval violates at least one ancestor's ordering rule. A value inside it satisfies all of them. Pushing children with narrowed bounds therefore checks every node against every applicable constraint, and the tree is valid exactly when no node is rejected.

## Complexity

- Time: `O(n)`, because each node is visited once.
- Space: `O(h)` for the explicit stack, where `h` is the tree height; `O(n)` in the worst case.

## Common mistakes

- Comparing only with the immediate parent.
- Using strict `<` and `>` against the bounds, which accepts duplicates.
- Using a fixed integer for infinity and colliding with a real node value.
- Treating an empty tree as invalid.
