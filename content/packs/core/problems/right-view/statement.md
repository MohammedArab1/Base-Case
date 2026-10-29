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
Input: root = [5,2,9,1,4,8,10]
Output: [5,9,10]
```

**Example 2**

```
Input: root = [5,2,9,null,4]
Output: [5,9,4]
```

The node `4` is visible below the right child `9`.

**Example 3**

```
Input: root = [5,null,9]
Output: [5,9]
```

**Example 4**

```
Input: root = [5]
Output: [5]
```

**Example 5**

```
Input: root = []
Output: []
```

## Constraints

- `0 <= number of nodes <= 100,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

Can you produce the same view with a depth-first search that visits the right child first?
