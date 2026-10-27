# Explanation

## Key insight

Preorder always presents a parent before its descendants. Inorder tells us when a subtree has been fully consumed: the stack top matches the next inorder value exactly when that subtree's root should be popped.

## Algorithm

1. Create the root from the first preorder value.
2. For each later value, create a node.
3. If the stack top does not match the next inorder value, attach the node as the left child.
4. Otherwise pop completed nodes and attach the new node as the right child of the last popped node.
5. Push the new node and return the root.

## Correctness

The stack holds the path from the root to the node currently being built. When the top matches inorder, its left subtree is complete, so it is popped; after popping all completed ancestors, the new value must begin the next right subtree. This mirrors the recursive split exactly, so the reconstructed structure is the original tree.

## Complexity

- Time: `O(n)`.
- Space: `O(n)`.

## Common mistakes

- Assuming a full or balanced tree.
- Using the inorder index without advancing it.
- Attaching a right child before popping all completed ancestors.

## Related pattern

The same split logic reconstructs a tree from postorder and inorder.
