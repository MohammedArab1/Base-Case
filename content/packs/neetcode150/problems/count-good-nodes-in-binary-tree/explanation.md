# Explanation

## Key insight

Whether a node is unobstructed depends only on the maximum value on the path from the root to its parent. That maximum can be carried down during a depth-first traversal.

## Algorithm

1. Push `(root, root.val)` onto a stack.
2. Pop a `(node, maximum)` pair, where `maximum` is the largest value on the path to the node's parent.
3. If the node's value is at least `maximum`, increment the count.
4. Compute the new maximum as the larger of `maximum` and the node's value.
5. Push each non-null child with the new maximum.
6. Return the count when the stack is empty.

## Correctness

The carried maximum is the largest value on the path from the root through the current node's parent; the root starts with its own value as the initial maximum. A node is unobstructed exactly when its value is at least that maximum, so the comparison increments the count for precisely the unobstructed nodes. Pushing the updated maximum to the children preserves the invariant. Every node is visited once, so the final count is correct.

## Complexity

- Time: `O(n)`, visiting every node once.
- Space: `O(h)` for the traversal stack, where `h` is the tree height. The worst case is `O(n)` for a skewed tree.

## Common mistakes

- Comparing a node only with its immediate parent instead of the whole path.
- Forgetting that the root is always unobstructed.
- Using a strict comparison and excluding nodes equal to the current maximum.
- Failing to update the maximum before descending.
- Returning zero for an empty tree without handling the null root in the traversal.
