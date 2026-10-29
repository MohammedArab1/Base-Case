# Merge Sorted Chains

You are given the heads of two singly linked lists, `first` and `second`. Each list is sorted in ascending order.

Merge the two lists into one sorted list by reusing the existing nodes, and return the head of the merged list. Either input may be empty.

## Input

- `first`: the head of the first sorted linked list, or `null`.
- `second`: the head of the second sorted linked list, or `null`.

## Output

The head of the merged sorted linked list, or `null` when both inputs are empty.

## Examples

**Example 1**

```
Input: first = [2, 5, 8], second = [1, 3, 9]
Output: [1, 2, 3, 5, 8, 9]
```

**Example 2**

```
Input: first = [-7, -2], second = [-5, 0, 4]
Output: [-7, -5, -2, 0, 4]
```

**Example 3**

```
Input: first = [], second = [6, 6]
Output: [6, 6]
```

**Example 4**

```
Input: first = [10], second = []
Output: [10]
```

**Example 5**

```
Input: first = [], second = []
Output: []
```

## Constraints

- `0 <= first.length + second.length <= 100,000`
- `-1,000,000,000 <= node values <= 1,000,000,000`
- Both input lists are sorted in ascending order.

## Follow-up

How would you merge `k` sorted linked lists efficiently?
