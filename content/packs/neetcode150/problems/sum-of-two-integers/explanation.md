## Approach

Binary addition without carries is XOR: each bit produces `1` when the operands differ. The positions where both operands have a `1` generate a carry into the next position, which is `(a & b) << 1`.

Set `a` to the carry-free sum and `b` to the carry bits, then repeat. Each round moves carries farther left. When no carries remain, `a` holds the sum.

In Python, integers have unbounded width, so mask intermediate values to 32 bits and convert the final unsigned pattern back to a signed value. Languages with native 32-bit signed bitwise operations already perform this wraparound.

## Correctness

At every step, the sum modulo `2^32` is preserved: the XOR captures the sum bits, and the shifted AND captures the carry bits. The carry value gains at least one trailing zero each iteration, so after finitely many steps it becomes zero. At that point the accumulated value is the exact sum modulo `2^32`. Masking implements the required two's-complement wraparound, and interpreting the final pattern through its sign bit produces the signed result, which is guaranteed to fit.

## Complexity

- Time: `O(1)`, because the carry propagates through at most 32 positions.
- Space: `O(1)`.

## Common mistakes

- Forgetting to shift the carry left.
- Using OR instead of XOR for the carry-free sum.
- Not masking intermediates in Python, producing an unsigned result for negative sums.
- Continuing after the carry becomes zero.

## Related pattern

Carry propagation is also used in bitwise subtraction and in adding digit arrays.
