# Explanation

## Key insight

Counting from the end is easy if two pointers maintain a fixed gap. After moving the leading pointer `n + 1` steps from a dummy node, advancing both pointers until the leader leaves the chain leaves the trailing pointer exactly one node before the target.

## Algorithm

1. Create a dummy node whose `next` is the original head.
2. Start `lead` and `trail` at the dummy.
3. Move `lead` forward `n + 1` times.
4. While `lead` is not null, advance both pointers one step.
5. The `trail` pointer now sits immediately before the node to remove, so set `trail.next = trail.next.next`.
6. Return `dummy.next`.

## Correctness

There are `length + 1` nodes including the dummy. Moving `lead` `n + 1` steps from the dummy leaves it `length - n` steps before the end. Advancing both pointers until `lead` becomes null moves `trail` exactly `length - n` steps, placing it just before the node at position `length - n + 1` in one-based order, which is the `n`-th node from the end. The pointer update unlinks that node. The dummy handles the case where the removed node is the original head.

## Complexity

- Time: `O(n)`, one pass over the chain.
- Space: `O(1)` extra space.

## Common mistakes

- Advancing the leader only `n` steps instead of `n + 1`.
- Not using a dummy node and crashing when removing the head.
- Dereferencing a null `lead` because the gap was too large.
- Returning the dummy node instead of `dummy.next`.
