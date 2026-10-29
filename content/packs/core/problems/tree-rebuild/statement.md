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
Input: preorder = [7,3,2,5,11,9,13], inorder = [2,3,5,7,9,11,13]
Output: [7,3,11,2,5,9,13]
```

**Example 2**

```
Input: preorder = [5,2,1,4,8,7,9], inorder = [1,2,4,5,7,8,9]
Output: [5,2,8,1,4,7,9]
```

**Example 3**

```
Input: preorder = [9], inorder = [9]
Output: [9]
```

**Example 4**

```
Input: preorder = [4,2,1,3], inorder = [1,2,3,4]
Output: [4,2,null,1,3]
```

**Example 5**

```
Input: preorder = [1,2,4,5,3,6], inorder = [4,2,5,1,6,3]
Output: [1,2,3,4,5,6]
```

## Constraints

- `1 <= preorder.length == inorder.length <= 3,000`
- All values are distinct.
- Both traversals describe the same binary tree.

## Follow-up

Can you avoid recursion and the index map with a stack-based construction?
