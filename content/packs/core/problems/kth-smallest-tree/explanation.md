# Explanation

## Key insight

Inorder traversal produces the BST values in sorted order. The `k`th visited node is therefore the answer.

## Algorithm

1. Use a stack and start at the root.
2. Push all left descendants of the current node.
3. Pop one node; it is the next smallest value.
4. Decrement `k` and return the value when it reaches zero.
5. Otherwise continue with the popped node's right subtree.

## Correctness

The stack simulates inorder traversal: all smaller values are processed before a node, and all larger values after it. Each pop visits the next value in sorted order. After `k` pops, the returned node is exactly the `k`th smallest. Stopping early does not affect the order.

## Complexity

- Time: `O(h + k)`, where `h` is the tree height.
- Space: `O(h)` for the stack.

## Common mistakes

- Using preorder or postorder traversal.
- Treating `k` as zero-based.
- Visiting the whole tree when early stopping is possible.

## Related pattern

Inorder traversal also validates a BST and finds successors.
