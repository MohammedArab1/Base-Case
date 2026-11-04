# Flip Chain Segments

A singly linked chain holds integers. Scan from the head and split the chain into consecutive blocks of `k` nodes. Reverse the links inside every block that contains exactly `k` nodes. Leave the final block, if it has fewer than `k` nodes, in its original order.

Return the head of the resulting chain. Node labels never move between nodes; only the links change.

## Input

- `head`: the head of the chain, or `null`.
- `k`: the block size, at least 1.

## Output

Return the head of the rearranged chain.

## Examples

**Example 1**

```
Input: head = [1, 2, 3, 4, 5], k = 2
Output: [2, 1, 4, 3, 5]
```

**Example 2**

```
Input: head = [1, 2, 3, 4, 5], k = 3
Output: [3, 2, 1, 4, 5]
```

**Example 3**

```
Input: head = [1, 2, 3, 4], k = 4
Output: [4, 3, 2, 1]
```

**Example 4**

```
Input: head = [1, 2, 3], k = 5
Output: [1, 2, 3]
```

## Constraints

- `0 <= number of nodes <= 10,000`
- `1 <= k <= 10,000`
- `-1,000,000,000 <= node value <= 1,000,000,000`
- Aim for `O(n)` time and `O(1)` extra space.

## Follow-up

How would you reverse every other block of `k` nodes instead of every block?
