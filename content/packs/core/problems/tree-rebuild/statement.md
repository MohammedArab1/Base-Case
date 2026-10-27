# Tree Rebuild

A binary tree contains distinct values. You are given its preorder and inorder traversals. Reconstruct the tree and return its root.

- Preorder lists each node before its children.
- Inorder lists the left subtree, then the node, then the right subtree.

## Input

- `preorder`: the preorder traversal.
- `inorder`: the inorder traversal.

## Output

The root of the reconstructed tree.

## Examples

**Example 1**

```
Input: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
Output: [3,9,20,null,null,15,7]
```

**Example 2**

```
Input: preorder = [-1], inorder = [-1]
Output: [-1]
```

**Example 3**

```
Input: preorder = [1,2], inorder = [2,1]
Output: [1,2]
```

## Constraints

- `1 <= preorder.length == inorder.length <= 3,000`
- All values are distinct.
- Both traversals describe the same binary tree.

## Follow-up

Can you avoid recursion and the index map with a stack-based construction?
