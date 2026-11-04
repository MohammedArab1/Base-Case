# Drop the Nth from the Tail

A singly linked chain holds integer values. Remove the node whose position is `n` when counting backward from the tail, where `n = 1` means the last node, `n = 2` means the node before it, and so on.

Return the head of the resulting chain. The value `n` is always between 1 and the chain length, inclusive.

## Input

- `head`: the head of the chain, or `null`.
- `n`: the backward position to remove.

## Output

Return the head of the updated chain, or `null` if the chain becomes empty.

## Examples

**Example 1**

```
Input: head = [1, 2, 3, 4, 5], n = 2
Output: [1, 2, 3, 5]
```

**Example 2**

```
Input: head = [7], n = 1
Output: []
```

**Example 3**

```
Input: head = [1, 2], n = 1
Output: [1]
```

**Example 4**

```
Input: head = [1, 2, 3], n = 3
Output: [2, 3]
```

## Constraints

- `1 <= number of nodes <= 10,000`
- `1 <= n <= number of nodes`
- `-1,000,000,000 <= node value <= 1,000,000,000`

## Follow-up

Can you do it in one pass without first computing the length?
