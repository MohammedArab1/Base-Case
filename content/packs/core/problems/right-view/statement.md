# Right View

Imagine looking at a binary tree from its right side. Return the values of the nodes that are visible, ordered from top to bottom.

At each depth, the visible node is the rightmost node at that depth.

## Input

- `root`: the root of a binary tree, or `null`.

## Output

The visible values from top to bottom.

## Examples

**Example 1**

```
Input: root = [1,2,3,null,5,null,4]
Output: [1,3,4]
```

**Example 2**

```
Input: root = [1,null,3]
Output: [1,3]
```

**Example 3**

```
Input: root = []
Output: []
```

## Constraints

- `0 <= number of nodes <= 100,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

Can you produce the same view with a depth-first search that visits the right child first?
