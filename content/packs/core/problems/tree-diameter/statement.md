# Tree Diameter

The diameter of a binary tree is the number of edges on the longest path between any two nodes. The path does not have to pass through the root.

Return the diameter.

## Input

- `root`: the root of a binary tree, or `null`.

## Output

The number of edges on the longest path. An empty tree or a single node has diameter `0`.

## Examples

**Example 1**

```
Input: root = [1,2,3,4,5]
Output: 3
```

A longest path is `4 -> 2 -> 1 -> 3`.

**Example 2**

```
Input: root = [1,2]
Output: 1
```

**Example 3**

```
Input: root = [1]
Output: 0
```

## Constraints

- `0 <= number of nodes <= 100,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

Can you compute the diameter while computing subtree heights, without a second traversal?
