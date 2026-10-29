# Level Lines

Return the values of a binary tree grouped by depth. The root is at depth `0`; within each level, list values from left to right.

## Input

- `root`: the root of a binary tree, or `null`.

## Output

A list of levels, each level being a list of node values.

## Examples

**Example 1**

```
Input: root = [6,2,8,1,4,7,9]
Output: [[6],[2,8],[1,4,7,9]]
```

**Example 2**

```
Input: root = [5]
Output: [[5]]
```

**Example 3**

```
Input: root = []
Output: []
```

**Example 4**

```
Input: root = [10,5,15,2,7]
Output: [[10],[5,15],[2,7]]
```

**Example 5**

```
Input: root = [1,2,null,3]
Output: [[1],[2],[3]]
```

## Constraints

- `0 <= number of nodes <= 100,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

Can you produce the levels without storing node objects for every level at once?
