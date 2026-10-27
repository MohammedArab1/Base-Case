# Explanation

## Key insight

A visited set solves the problem but costs linear space. Two pointers at different speeds detect a cycle using only two references.

## Algorithm

1. Build the list and apply the optional tail link.
2. Start both `slow` and `fast` at the head.
3. While `fast` and `fast.next` exist, advance `slow` by one and `fast` by two.
4. If the pointers meet, return `true`.
5. If `fast` reaches the end, return `false`.

## Correctness

Without a cycle, the faster pointer reaches the end. With a cycle, both pointers eventually enter it. The faster pointer gains one position per iteration relative to the slower one, so it must eventually coincide with it. Thus the algorithm returns exactly when a cycle exists.

## Complexity

- Time: `O(n)`.
- Space: `O(1)`.

## Common mistakes

- Advancing `fast` without checking `fast.next`.
- Comparing values rather than node references.
- Forgetting that a single node can point to itself.

## Related pattern

The same slow/fast technique finds the middle of a list and the start of a cycle.
