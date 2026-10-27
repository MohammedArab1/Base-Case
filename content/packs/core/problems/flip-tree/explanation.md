# Explanation

## Key insight

Mirroring a tree is just swapping children at every node. The structure of the tree does not change shape; only the direction of each edge reverses for each parent.

## Algorithm

1. If the node is null, return null.
2. Put the root on a stack.
3. Pop a node, swap its left and right child references, and push the children that exist.
4. When the stack is empty, return the original root.

## Correctness

Each node is visited once and has its two child references swapped, so every subtree becomes a mirror of its original self. Children are pushed after the swap, which lets the traversal reach the entire tree without recursion. The root object is unchanged, so returning it is correct even for an empty tree.

## Complexity

- Time: `O(n)`, visiting every node once.
- Space: `O(n)` for the explicit stack in the worst case, `O(h)` for a balanced tree.

## Common mistakes

- Swapping values instead of child links.
- Returning a child instead of the root.
- Forgetting the null base case.
- Double-swapping through both recursion directions.
