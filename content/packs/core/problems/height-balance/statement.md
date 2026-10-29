# Height Balance

A binary tree is **height-balanced** when, at every node, the heights of its left and right subtrees differ by at most one. The height of an empty tree is `0`; the height of a non-empty tree is the number of nodes on its longest root-to-leaf path.

Return whether the tree is height-balanced.

## Input

- `root`: the root of a binary tree, or `null`.

## Output

`true` if every node satisfies the balance condition, otherwise `false`.

## Examples

**Example 1**

```
Input: root = [8,3,10,1,6,null,14]
Output: true
```

**Example 2**

```
Input: root = [5,2,8,1,null,null,9,0]
Output: false
```

The left subtree of `2` has height `2`, while its right subtree is empty.

**Example 3**

```
Input: root = []
Output: true
```

**Example 4**

```
Input: root = [7]
Output: true
```

**Example 5**

```
Input: root = [1,2,3,4,5,6,7]
Output: true
```

## Constraints

- `0 <= number of nodes <= 100,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

Can you return the height and the balance result together so each node is processed once?
