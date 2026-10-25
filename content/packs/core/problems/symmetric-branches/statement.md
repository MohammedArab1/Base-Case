# Symmetric Branches

A binary tree is symmetric when its left and right subtrees are mirror images of each other around the root. Return `true` when the tree is symmetric.

An empty tree is symmetric.

## Input

- `root`: the root of a binary tree, or `null`.

## Output

`true` when the tree is symmetric, otherwise `false`.

## Examples

**Example 1**

```
Input: root = [1, 2, 2, 3, 4, 4, 3]
Output: true
```

The left subtree is a mirror of the right subtree.

**Example 2**

```
Input: root = [1, 2, 2, null, 3, null, 3]
Output: false
```

The value `3` appears on the right of the left subtree, but there is no matching `3` on the left of the right subtree.

**Example 3**

```
Input: root = [1]
Output: true
```

A single node is symmetric.

**Example 4**

```
Input: root = []
Output: true
```

**Example 5**

```
Input: root = [1, 2, 2]
Output: true
```

The two children have the same value and both subtrees are empty.

## Constraints

- `0 <= number of nodes <= 10,000`
- `-1,000,000,000 <= node values <= 1,000,000,000`

## Follow-up

Can you solve it iteratively without recursion?
