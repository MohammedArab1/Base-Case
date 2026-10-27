# Kth Smallest Tree

A binary search tree contains distinct values. Return the `k`th smallest value, where `k` is one-based.

## Input

- `root`: the root of a non-empty binary search tree.
- `k`: the rank to return, from `1` to the number of nodes.

## Output

The `k`th smallest value.

## Examples

**Example 1**

```
Input: root = [3,1,4,null,2], k = 1
Output: 1
```

**Example 2**

```
Input: root = [5,3,6,2,4,null,null,1], k = 3
Output: 3
```

**Example 3**

```
Input: root = [1], k = 1
Output: 1
```

## Constraints

- `1 <= number of nodes <= 100,000`
- `1 <= k <= number of nodes`
- All node values are distinct and satisfy the BST ordering.

## Follow-up

How would you answer many rank queries without traversing from the root each time?
