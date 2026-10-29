# Search Tree Check

A binary tree is a **strict binary search tree** when, for every node:

- every value in its left subtree is strictly smaller than the node's value;
- every value in its right subtree is strictly greater than the node's value;
- both subtrees satisfy the same rules.

Given the root of a binary tree, decide whether it is a strict binary search tree. An empty tree counts as valid.

## Input

- `root`: the root of a binary tree, or `null`.

## Output

`true` if the tree satisfies the strict ordering rules, otherwise `false`.

## Examples

**Example 1**

```
Input: root = [6, 3, 9, 1, 5, 8, 11]
Output: true
```

**Example 2**

```
Input: root = [6, 3, 9, 1, 5, 7, 8]
Output: false
```

The `8` sits in the right subtree of `9`, where every value must be greater than `9`.

**Example 3**

```
Input: root = []
Output: true
```

An empty tree has no violations.

**Example 4**

```
Input: root = [4, 2, 2]
Output: false
```

Equal values are not allowed.

**Example 5**

```
Input: root = [20, 10, 30, 5, 15, 25, 35]
Output: true
```

## Constraints

- `0 <= number of nodes <= 10,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

How would you validate the tree using an in-order traversal and constant extra state beyond the traversal?
