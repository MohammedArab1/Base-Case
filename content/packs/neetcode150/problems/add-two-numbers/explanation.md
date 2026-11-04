# Explanation

## Key insight

Because the digits are stored least-significant first, traversing from the heads visits corresponding place values in the same order as ordinary school addition. Only a carry needs to move forward.

## Algorithm

1. Create a dummy node and a tail pointer.
2. Keep a `carry` value, initially zero.
3. While either chain has a node or the carry is nonzero, compute `total = carry + digit1 + digit2`, using zero for a missing digit.
4. Set `carry = total // 10` and append a node holding `total % 10`.
5. Return `dummy.next`.

## Correctness

At each step, the algorithm appends the digit for the current place value and carries the overflow to the next place, exactly matching decimal addition. The loop visits every input digit, and the final carry is handled because the loop condition includes `carry > 0`. The resulting chain therefore represents the sum with the least-significant digit at the head.

## Complexity

- Time: `O(max(m, n))`, where `m` and `n` are the chain lengths.
- Space: `O(1)` extra space beyond the returned chain.

## Common mistakes

- Aligning the chains from the most-significant end.
- Forgetting the final carry when both chains are exhausted.
- Stopping as soon as one chain ends.
- Assuming the carry can never exceed one.
- Creating an extra leading zero in the result.
