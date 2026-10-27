# Flip Tree

Mirror a binary tree: at every node, swap its left and right children. Return the root of the transformed tree.

An empty tree stays empty.

## Input

- `root`: the root of a binary tree, or `null`.

## Output

The root of the mirrored tree.

## Examples

**Example 1**

```
Input: root = [4, 2, 7, 1, 3, 6, 9]
Output: [4, 7, 2, 9, 6, 3, 1]
```

**Example 2**

```
Input: root = []
Output: []
```

**Example 3**

```
Input: root = [1, 2]
Output: [1, null, 2]
```

## Constraints

- `0 <= number of nodes <= 100,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

Can you do it iteratively with a queue?
