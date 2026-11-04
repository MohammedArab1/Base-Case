# Unobstructed Nodes

A node in a binary tree is unobstructed when every node on the path from the root to that node has a value less than or equal to the node's own value. The root is always unobstructed.

Count the unobstructed nodes in the tree. An empty tree has none.

## Input

- `root`: the root of a binary tree, or `null`.

## Output

Return the number of unobstructed nodes as an `int`.

## Examples

**Example 1**

```
Input: root = [3, 1, 4, 3, null, 1, 5]
Output: 4
```

The unobstructed nodes hold `3` (the root), `3` (the left child of `1`), `4`, and `5`.

**Example 2**

```
Input: root = [3, 3, null, 4, 2]
Output: 3
```

**Example 3**

```
Input: root = [1]
Output: 1
```

**Example 4**

```
Input: root = []
Output: 0
```

## Constraints

- `0 <= number of nodes <= 100,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

Can you compute the count iteratively with a stack of `(node, maximumSoFar)` pairs?
