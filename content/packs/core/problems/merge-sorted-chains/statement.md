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
Input: first = [1, 2, 4], second = [1, 3, 4]
Output: [1, 1, 2, 3, 4, 4]
```

**Example 2**

```
Input: first = [], second = []
Output: []
```

**Example 3**

```
Input: first = [], second = [0]
Output: [0]
```

**Example 4**

```
Input: first = [1, 3, 5], second = [2, 4, 6]
Output: [1, 2, 3, 4, 5, 6]
```

**Example 5**

```
Input: first = [1], second = [2]
Output: [1, 2]
```

## Constraints

- `0 <= first.length + second.length <= 100,000`
- `-1,000,000,000 <= node values <= 1,000,000,000`
- Both input lists are sorted in ascending order.

## Follow-up

How would you merge `k` sorted linked lists efficiently?
