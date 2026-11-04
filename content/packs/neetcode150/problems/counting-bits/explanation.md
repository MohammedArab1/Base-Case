## Approach

Build the table from `0` upward. For any positive integer `i`, shifting right by one removes its least significant bit. The remaining bits are exactly those of `i >> 1`, whose count has already been computed. Add one if the removed bit was set, which is `i & 1`.

The base case `counts[0] = 0` is correct because zero has no set bits.

## Correctness

The binary representation of `i` consists of the binary representation of `i >> 1` followed by the bit `i & 1`. Therefore the number of set bits in `i` is the number in `i >> 1` plus one exactly when the final bit is set. Since `i >> 1 < i`, the recurrence only uses already-computed entries. Induction on `i` proves every table entry is correct, and the table is returned in the required increasing order.

## Complexity

- Time: `O(n)`, with constant work per entry.
- Space: `O(n)` for the returned table.

## Common mistakes

- Using `i >> 1` without accounting for the removed bit.
- Starting the loop at `0` and accessing a negative or missing entry.
- Returning counts in bit-length order rather than integer order.
- Forgetting that the array length is `n + 1`, not `n`.

## Related pattern

This is a standard dynamic-programming recurrence over bit representations.
