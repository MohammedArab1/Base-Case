# Explanation

## Key insight

Every node needs its `next` pointer to face backward. The only tricky part is that rewiring a node loses the forward link, so the next node must be saved before the pointer changes.

## Algorithm

1. Set `previous = null` and `current = head`.
2. While `current` is not null:
   - Save `current.next` as `following`.
   - Point `current.next` at `previous`.
   - Move `previous` to `current`.
   - Move `current` to `following`.
3. Return `previous`, which is the last node processed and therefore the new head.

## Correctness

At the start of each iteration, `previous` is the head of the reversed portion of the list, and `current` is the first unreversed node. Rewiring `current.next` to `previous` appends the current node to the reversed portion, and the two pointer moves maintain the invariant. When `current` becomes null, every node has been reversed and `previous` is the new head.

## Complexity

- Time: `O(n)`, because each node is visited once.
- Space: `O(1)` extra space; only three node references are stored.

## Common mistakes

- Overwriting `current.next` before saving the next node.
- Returning `head`, which is now the tail.
- Forgetting that an empty list should return `null`.
- Using recursion on a very long list, which can exceed the call-stack limit.
