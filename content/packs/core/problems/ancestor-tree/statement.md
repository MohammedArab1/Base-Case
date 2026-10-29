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
Input: root = [7,3,11,1,5,9,13], first = 1, second = 5
Output: 3
```

**Example 2**

```
Input: root = [7,3,11,1,5,9,13], first = 3, second = 13
Output: 7
```

**Example 3**

```
Input: root = [10,4,14,2,6,12,16], first = 2, second = 6
Output: 4
```

**Example 4**

```
Input: root = [1], first = 1, second = 1
Output: 1
```

A node is its own ancestor.

**Example 5**

```
Input: root = [20,8,22,4,12,null,24], first = 12, second = 24
Output: 20
```

## Constraints

- `1 <= number of nodes <= 100,000`
- All node values are distinct.
- `first` and `second` appear in the tree.

## Follow-up

How would you answer many ancestor queries on the same tree?
