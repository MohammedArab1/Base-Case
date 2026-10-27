# Ancestor Tree

A binary tree contains unique values. Given two values that both appear, return the value of their lowest common ancestor.

The lowest common ancestor is the deepest node that has both values in its subtree. A node may be an ancestor of itself. Unlike a search tree, the values are not ordered.

## Input

- `root`: the root of a non-empty binary tree.
- `first`, `second`: values known to exist in the tree.

## Output

The value of the lowest common ancestor.

## Examples

**Example 1**

```
Input: root = [3,5,1,6,2,0,8,null,null,7,4], first = 5, second = 1
Output: 3
```

**Example 2**

```
Input: root = [3,5,1,6,2,0,8,null,null,7,4], first = 5, second = 4
Output: 5
```

**Example 3**

```
Input: root = [1,2], first = 1, second = 2
Output: 1
```

## Constraints

- `1 <= number of nodes <= 100,000`
- All node values are distinct.
- `first` and `second` appear in the tree.

## Follow-up

How would you answer many ancestor queries on the same tree?
