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
Input: root = [9, 4, 13, 2, 6, 11, 15]
Output: [9, 13, 4, 15, 11, 6, 2]
```

**Example 2**

```
Input: root = []
Output: []
```

**Example 3**

```
Input: root = [5, 3]
Output: [5, null, 3]
```

**Example 4**

```
Input: root = [1, 2, 3, 4, 5]
Output: [1, 3, 2, null, null, 5, 4]
```

**Example 5**

```
Input: root = [7]
Output: [7]
```

## Constraints

- `0 <= number of nodes <= 100,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

Can you do it iteratively with a queue?
