# Explanation

## Key insight

Equality of trees is defined recursively: the roots must agree, and the left and right subtrees must each be equal. A synchronized traversal compares corresponding positions.

## Algorithm

1. Push the pair of roots onto a stack.
2. Pop a pair. If both nodes are null, continue with the next pair.
3. If exactly one node is null, return `false`.
4. If the two values differ, return `false`.
5. Otherwise push the pair of left children and the pair of right children.
6. If the stack empties, every corresponding pair matched, so return `true`.

## Correctness

The stack holds pairs of nodes that sit at corresponding positions. Popping a pair and checking both null, one null, and unequal values covers every local mismatch. Pushing the children preserves the correspondence for the next level. Because the traversal visits every corresponding pair exactly once, an empty stack means the trees have identical shapes and labels. A mismatch is reported immediately.

## Complexity

- Time: `O(n)`, where `n` is the number of nodes in the smaller tree, since the traversal stops at the first mismatch.
- Space: `O(h)` for the traversal stack, where `h` is the tree height.

## Common mistakes

- Comparing only values and ignoring shape differences.
- Forgetting the case where exactly one node is null.
- Traversing with different orders for the two trees.
- Using a global "equal so far" flag and continuing after a mismatch.
