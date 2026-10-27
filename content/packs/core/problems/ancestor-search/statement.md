# Ancestor Search

A binary search tree contains unique values. Given two values that both appear in the tree, return the value of their lowest common ancestor.

The lowest common ancestor of two nodes is the deepest node that has both nodes in its subtree. A node may be an ancestor of itself.

## Input

- `root`: the root of a non-empty binary search tree.
- `first`, `second`: values known to exist in the tree.

## Output

The value of the lowest common ancestor.

## Examples

**Example 1**

```
Input: root = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], first = 2, second = 8
Output: 6
```

**Example 2**

```
Input: root = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], first = 2, second = 4
Output: 2
```

A node can be its own ancestor.

**Example 3**

```
Input: root = [2, 1, 3], first = 1, second = 3
Output: 2
```

## Constraints

- `1 <= number of nodes <= 100,000`
- All node values are distinct.
- `first` and `second` appear in the tree.
- The tree satisfies the binary search tree ordering.

## Follow-up

How would you solve it without using the search-tree ordering?
