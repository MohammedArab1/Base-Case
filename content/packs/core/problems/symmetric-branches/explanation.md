# Explanation

## Key insight

Symmetry is a pairwise property. The left child of the left subtree must mirror the right child of the right subtree, and the right child of the left subtree must mirror the left child of the right subtree. Comparing whole subtrees level by level is not enough.

## Algorithm

1. If the root is null, return `true`.
2. Put the pair `(root.left, root.right)` in a queue.
3. While the queue is not empty:
   - Remove a pair `(left, right)`.
   - If both are null, continue.
   - If exactly one is null, return `false`.
   - If their values differ, return `false`.
   - Add `(left.left, right.right)` and `(left.right, right.left)`.
4. If the queue empties without a failure, return `true`.

## Correctness

Each pair represents two positions that must mirror each other. The algorithm checks their values and then enqueues the two pairs of children that must also mirror each other. Every node in the tree is visited once, and any structural or value mismatch is detected. If the loop completes, every mirrored pair matched, so the tree is symmetric.

## Complexity

- Time: `O(n)`, because each node is visited once.
- Space: `O(n)` in the worst case, for the queue.

## Common mistakes

- Comparing `left.left` with `right.left` instead of `right.right`.
- Treating one null child and one non-null child as symmetric.
- Using recursion without considering the stack depth on a deep tree.
