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
Input: root = [4,2,6,1,3,null,7]
Output: 4
```

A longest path is `1 -> 2 -> 4 -> 6 -> 7`.

**Example 2**

```
Input: root = [8,3,10,1,6,null,14]
Output: 4
```

**Example 3**

```
Input: root = [5,1]
Output: 1
```

**Example 4**

```
Input: root = [9]
Output: 0
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

Can you compute the diameter while computing subtree heights, without a second traversal?
