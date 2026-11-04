# Embedded Subtree

A tree `subRoot` is embedded in a tree `root` when some node of `root` is the root of a subtree that is identical to `subRoot`. Identical means the same shape with the same integer at every corresponding node.

An empty `subRoot` is considered embedded in every tree. An empty `root` contains only the empty tree.

## Input

- `root`: the root of the larger binary tree, or `null`.
- `subRoot`: the root of the tree to look for, or `null`.

## Output

Return `true` if `subRoot` is embedded in `root`, otherwise `false`.

## Examples

**Example 1**

```
Input: root = [6, 2, 8, 1, 4, null, 9], subRoot = [2, 1, 4]
Output: true
```

**Example 2**

```
Input: root = [6, 2, 8, 1, 4, null, 9, null, null, 3], subRoot = [2, 1, 4]
Output: false
```

The subtree at node `2` has an extra `3` below node `4`, so it is not identical to `subRoot`.

**Example 3**

```
Input: root = [1], subRoot = [1]
Output: true
```

**Example 4**

```
Input: root = [], subRoot = []
Output: true
```

## Constraints

- `0 <= number of nodes in root <= 2,000`
- `0 <= number of nodes in subRoot <= 2,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

How would you get linear time by serializing both trees with null markers and searching for one encoding inside the other?
