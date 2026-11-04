## Approach

Process exactly 32 positions. At each step, read the least significant bit of the remaining input and append it to the right side of the result. Then remove that bit from the input by dividing it by two.

Appending with `result * 2 + bit` shifts the previously collected bits left, which places the newest bit in the least significant position. After 32 steps, the first bit read has been shifted 31 times and therefore occupies the most significant position.

## Correctness

After `k` steps, the result contains the first `k` bits of the original value in reverse order, and the remaining input contains the bits that have not yet been read. Each step appends exactly the next bit, preserving that invariant. After 32 steps, all bits have been read and the result is exactly the 32-bit reversal. Using arithmetic rather than signed bitwise shifts avoids interpreting the highest bit as a sign bit.

## Complexity

- Time: `O(1)`, because exactly 32 iterations are performed.
- Space: `O(1)`.

## Common mistakes

- Processing fewer than 32 bits for small inputs.
- Using signed shifts and producing a negative result.
- Appending the bit at the front instead of shifting the result left.
- Reversing only until the input becomes zero rather than always processing 32 bits.

## Related pattern

Bit-by-bit reversal is a small example of fixed-width word manipulation.
