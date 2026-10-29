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
Input: head = [3, 6, 9, 12]
Output: [12, 9, 6, 3]
```

**Example 2**

```
Input: head = [-2, -1, 0, 1]
Output: [1, 0, -1, -2]
```

**Example 3**

```
Input: head = []
Output: []
```

**Example 4**

```
Input: head = [7]
Output: [7]
```

A single node is already reversed.

**Example 5**

```
Input: head = [4, 4, 1]
Output: [1, 4, 4]
```

## Constraints

- `0 <= number of nodes <= 100,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

How would you reverse the list recursively without changing the `O(n)` time bound?
