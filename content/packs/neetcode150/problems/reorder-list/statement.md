# Fold a Chain

A singly linked chain stores integers in its nodes. Rearrange the chain so that it alternates between the two ends of the original order: the first node, then the last node, then the second node, then the second-to-last node, and so on. When the chain has an odd number of nodes, its middle node ends up last.

Return the head of the rearranged chain. Reuse the existing nodes rather than allocating a new chain. An empty chain stays empty.

## Input

- `head`: the head of a singly linked list, or `null`.

## Output

Return the head of the rearranged list.

## Examples

**Example 1**

```
Input: head = [1, 2, 3, 4]
Output: [1, 4, 2, 3]
```

**Example 2**

```
Input: head = [10, 20, 30, 40, 50]
Output: [10, 50, 20, 40, 30]
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

## Constraints

- `0 <= number of nodes <= 50,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`
- Aim for `O(n)` time and `O(1)` extra space.

## Follow-up

Can you perform the same rearrangement recursively? What extra space would the call stack use?
