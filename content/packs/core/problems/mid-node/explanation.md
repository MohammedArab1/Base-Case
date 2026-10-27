# Explanation

## Key insight

A fast pointer travels twice as far as a slow pointer in the same number of steps. When the fast pointer finishes, the slow pointer is at the midpoint.

## Algorithm

1. Start both pointers at the head.
2. While `fast` and `fast.next` exist, move `slow` one step and `fast` two.
3. Return `slow`.

## Correctness

After each iteration, the slow pointer has advanced half as many nodes as the fast pointer. The fast pointer stops only when it cannot move two more steps, meaning it has reached the end or the last node. At that point the slow pointer is at the second middle node for even lengths and the unique middle for odd lengths.

## Complexity

- Time: `O(n)`.
- Space: `O(1)`.

## Common mistakes

- Advancing the fast pointer without checking `fast.next`.
- Starting the fast pointer one node ahead and returning the first middle node for even lengths.
- Counting the length first, which requires two passes.

## Related pattern

The same slow/fast pairing detects cycles and finds the kth node from the end.
