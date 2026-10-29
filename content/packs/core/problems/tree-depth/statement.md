# Tree Depth

Return the maximum depth of a binary tree, measured as the number of nodes on the longest path from the root down to a leaf.

An empty tree has depth `0`.

## Input

- `root`: the root of a binary tree, or `null`.

## Output

The maximum node count along any root-to-leaf path.

## Examples

**Example 1**

```
Input: root = [7,3,11,2,5,null,13]
Output: 3
```

**Example 2**

```
Input: root = [10,5]
Output: 2
```

**Example 3**

```
Input: root = [1,null,4]
Output: 2
```

**Example 4**

```
Input: root = [9]
Output: 1
```

**Example 5**

```
Input: root = []
Output: 0
```

## Constraints

- `0 <= number of nodes <= 100,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

Can you compute it with breadth-first search and count levels instead?
