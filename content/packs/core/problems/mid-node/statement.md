# Mid Node

Return the middle node of a linked list. If the list has an even number of nodes, return the second of the two middle nodes.

The returned node represents the list starting at that node.

## Input

- `head`: the first node of a singly linked list, or `null`.

## Output

The middle node, or `null` for an empty list.

## Examples

**Example 1**

```
Input: head = [1,2,3,4,5]
Output: [3,4,5]
```

The middle node holds `3`.

**Example 2**

```
Input: head = [1,2,3,4]
Output: [3,4]
```

The two middle nodes hold `2` and `3`; the second one is returned.

**Example 3**

```
Input: head = [1]
Output: [1]
```

## Constraints

- `0 <= number of nodes <= 100,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

Can you find the middle in one pass without knowing the length in advance?
