# Reverse Chain

A singly linked list stores node values in order. Reverse the list by changing the `next` pointers, and return the new head.

Do not allocate replacement nodes; reuse the existing ones. The list may be empty.

## Input

- `head`: the first node of the linked list, or `null`.

## Output

The first node of the reversed list, or `null` when the input is empty.

## Examples

**Example 1**

```
Input: head = [1, 2, 3, 4, 5]
Output: [5, 4, 3, 2, 1]
```

**Example 2**

```
Input: head = []
Output: []
```

**Example 3**

```
Input: head = [1]
Output: [1]
```

A single node is already reversed.

**Example 4**

```
Input: head = [1, 2]
Output: [2, 1]
```

## Constraints

- `0 <= number of nodes <= 100,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

How would you reverse the list recursively without changing the `O(n)` time bound?
