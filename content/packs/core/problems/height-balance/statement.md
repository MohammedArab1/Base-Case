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
Input: root = [3,9,20,null,null,15,7]
Output: true
```

**Example 2**

```
Input: root = [1,2,2,3,3,null,null,4,4]
Output: false
```

**Example 3**

```
Input: root = []
Output: true
```

## Constraints

- `0 <= number of nodes <= 100,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

Can you return the height and the balance result together so each node is processed once?
