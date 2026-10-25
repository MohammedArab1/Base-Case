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
Input: root = [2, 1, 3]
Output: true
```

**Example 2**

```
Input: root = [5, 1, 4, null, null, 3, 6]
Output: false
```

The value `3` is less than the root `5`, but it sits in the root's right subtree.

**Example 3**

```
Input: root = []
Output: true
```

An empty tree has no violations.

**Example 4**

```
Input: root = [1, 1]
Output: false
```

Equal values are not allowed.

**Example 5**

```
Input: root = [10, 5, 15, null, null, 6, 20]
Output: false
```

Every direct parent-child comparison passes, but `6` is in the right subtree of `10`.

## Constraints

- `0 <= number of nodes <= 10,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

How would you validate the tree using an in-order traversal and constant extra state beyond the traversal?
