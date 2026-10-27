# Level Lines

Return the values of a binary tree grouped by depth. The root is at depth `0`; within each level, list values from left to right.

## Input

- `root`: the root of a binary tree, or `null`.

## Output

A list of levels, each level being a list of node values.

## Examples

**Example 1**

```
Input: root = [3,9,20,null,null,15,7]
Output: [[3],[9,20],[15,7]]
```

**Example 2**

```
Input: root = [1]
Output: [[1]]
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

Can you produce the levels without storing node objects for every level at once?
