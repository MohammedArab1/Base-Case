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
Input: root = [4,2,6,1,3,5,7], k = 4
Output: 4
```

**Example 2**

```
Input: root = [5,3,8,2,4,7,9], k = 5
Output: 7
```

**Example 3**

```
Input: root = [2,1,3], k = 2
Output: 2
```

**Example 4**

```
Input: root = [1], k = 1
Output: 1
```

**Example 5**

```
Input: root = [10,5,15,2,7,12,20], k = 7
Output: 20
```

## Constraints

- `1 <= number of nodes <= 100,000`
- `1 <= k <= number of nodes`
- All node values are distinct and satisfy the BST ordering.

## Follow-up

How would you answer many rank queries without traversing from the root each time?
